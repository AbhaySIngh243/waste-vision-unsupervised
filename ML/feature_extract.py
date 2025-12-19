# feature_extract.py
"""
Usage:
  python feature_extract.py --data_dir /path/to/dataset-resized --out_dir ./features --sample_rate 0.02

This:
 - walks class subfolders in data_dir (or images directly)
 - for each image: loads, resizes (keeping aspect), extracts conv feature map using ResNet50 conv backbone
 - saves each image's feature map to out_dir/<rel_path>.npy
 - also builds a single aggregated sample file 'patch_features_sample.npy' used for clustering
"""

import os
import argparse
from PIL import Image
import numpy as np
from tqdm import tqdm
import torch
import torch.nn as nn
import torchvision.transforms as T
from torchvision.models import resnet50
import joblib
import random

def make_backbone(device):
    model = resnet50(pretrained=True)
    # take everything up to the last 2 layers to get spatial map: children()[:-2]
    backbone = nn.Sequential(*list(model.children())[:-2]).to(device)
    backbone.eval()
    return backbone

def image_paths_from_dir(data_dir):
    exts = ('.jpg','.jpeg','.png','.bmp')
    paths = []
    for root,_,files in os.walk(data_dir):
        for f in files:
            if f.lower().endswith(exts):
                full = os.path.join(root,f)
                rel = os.path.relpath(full, data_dir)
                paths.append((full, rel))
    return paths

def extract_and_save(backbone, img_path, rel_path, out_dir, device, transform):
    img = Image.open(img_path).convert('RGB')
    # transform -> resize to 512 (keep aspect) so feature map not too small
    img_t = transform(img).unsqueeze(0).to(device)  # [1,3,H,W]
    with torch.no_grad():
        feat = backbone(img_t)  # [1,C,Hf,Wf]
        feat = feat.squeeze(0).cpu().numpy()  # [C,Hf,Wf]
    # save as npy
    out_path = os.path.join(out_dir, rel_path + '.npy')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    np.save(out_path, feat)
    return feat  # as numpy

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_dir', required=True)
    parser.add_argument('--out_dir', default='./features')
    parser.add_argument('--device', default='cuda' if torch.cuda.is_available() else 'cpu')
    parser.add_argument('--sample_rate', type=float, default=0.02, help='fraction of patches to keep for clustering sample (e.g., 0.02)')
    args = parser.parse_args()

    device = args.device
    backbone = make_backbone(device)

    transform = T.Compose([
        T.Lambda(lambda img: img.resize((512, int(512 * img.size[1] / img.size[0])))) if True else T.Resize(512),
        T.ToTensor(),
        T.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
    ])

    paths = image_paths_from_dir(args.data_dir)
    print(f"Found {len(paths)} images.")
    sampled_patches = []
    for full, rel in tqdm(paths):
        feat = extract_and_save(backbone, full, rel, args.out_dir, device, transform)
        # feat shape: (C, Hf, Wf) -> patches = Hf*Wf rows of length C
        C,Hf,Wf = feat.shape
        patches = feat.reshape(C, -1).T  # (Hf*Wf, C)
        # randomly sample a few patches
        k = max(1, int(args.sample_rate * patches.shape[0]))
        # choose k random indices
        idx = np.random.choice(patches.shape[0], size=k, replace=False)
        sampled_patches.append(patches[idx])
    if sampled_patches:
        sampled = np.concatenate(sampled_patches, axis=0)
        # save sample for clustering
        os.makedirs(args.out_dir, exist_ok=True)
        sample_path = os.path.join(args.out_dir, 'patch_features_sample.npy')
        np.save(sample_path, sampled.astype(np.float32))
        print("Saved patch feature sample to", sample_path)
    print("Done.")

if __name__ == '__main__':
    main()
