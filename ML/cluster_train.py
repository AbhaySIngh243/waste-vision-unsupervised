# cluster_train.py
"""
Usage:
  python cluster_train.py --features_dir ./features --n_clusters 6 --out_model clusters_k6.joblib

Produces:
 - saved sklearn MiniBatchKMeans model: joblib file
"""

import argparse
import os
import numpy as np
from sklearn.cluster import MiniBatchKMeans
import joblib
from tqdm import tqdm

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--features_dir', default='./features')
    parser.add_argument('--sample_file', default='patch_features_sample.npy')
    parser.add_argument('--n_clusters', type=int, default=6)
    parser.add_argument('--batch_size', type=int, default=4096)
    parser.add_argument('--out_model', default='clusters_k.joblib')
    args = parser.parse_args()

    sample_path = os.path.join(args.features_dir, args.sample_file)
    assert os.path.exists(sample_path), "sample file not found: " + sample_path
    print("Loading sample features...", sample_path)
    X = np.load(sample_path)  # shape (N, C)
    print("Sample shape:", X.shape)
    # optionally normalize
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)
    print("Training MiniBatchKMeans with n_clusters=", args.n_clusters)
    mbk = MiniBatchKMeans(n_clusters=args.n_clusters, batch_size=args.batch_size, random_state=0, verbose=1)
    mbk.fit(Xs)
    # Save both scaler + kmeans
    model = {'kmeans': mbk, 'scaler_mean': scaler.mean_, 'scaler_scale': scaler.scale_}
    joblib.dump(model, args.out_model)
    print("Saved cluster model to", args.out_model)

if __name__ == '__main__':
    main()
