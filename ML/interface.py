import os

# Try importing torch FIRST to avoid DLL conflicts with numpy/sklearn
try:
    import torch
    import torch.nn as nn
    import torchvision.transforms as T
    from torchvision.models import resnet50
except (ImportError, OSError) as e:
    print(f"Error importing torch: {e}")
    torch = None

import joblib
import numpy as np
import matplotlib
matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.colors
import seaborn as sns
from PIL import Image
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score, silhouette_samples
from sklearn.neighbors import KNeighborsClassifier

def make_backbone(device):
    if torch is None:
        raise ImportError("PyTorch is not available. Please install it.")
    model = resnet50(pretrained=True)
    backbone = nn.Sequential(*list(model.children())[:-2]).to(device)
    backbone.eval()
    return backbone

def run_inference(image_path, model_path, out_path):
    if torch is None:
        raise ImportError("PyTorch is not available. Cannot run inference.")
        
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    # Load model
    print(f"Loading model from {model_path}...")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
        
    data = joblib.load(model_path)
    kmeans = data['kmeans']
    scaler_mean = data['scaler_mean'].astype(np.float32)
    scaler_scale = data['scaler_scale'].astype(np.float32)
    
    # Load and transform image
    print(f"Processing image {image_path}...")
    img = Image.open(image_path).convert('RGB')
    
    # Resize logic to match feature extraction (512 width, keep aspect)
    target_width = 512
    w, h = img.size
    target_height = int(target_width * h / w)
    
    transform = T.Compose([
        T.Resize((target_height, target_width)), 
        T.ToTensor(),
        T.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
    ])
    
    img_t = transform(img).unsqueeze(0).to(device)
    
    # Extract features
    print("Extracting features...")
    backbone = make_backbone(device)
    with torch.no_grad():
        feat = backbone(img_t) # [1, C, Hf, Wf]
        feat = feat.squeeze(0).cpu().numpy() # [C, Hf, Wf]
        
    C, Hf, Wf = feat.shape
    features_flat = feat.reshape(C, -1).T.astype(np.float32) # [N, C]
    
    # Scale features
    features_scaled = (features_flat - scaler_mean) / scaler_scale
    features_scaled = np.ascontiguousarray(features_scaled, dtype=np.float32)
    print(f"Features scaled shape: {features_scaled.shape}, dtype: {features_scaled.dtype}")
    
    # Predict clusters
    print("Predicting clusters...")
    labels = kmeans.predict(features_scaled)
    labels_img = labels.reshape(Hf, Wf)
    
    # Create colored mask
    cmap = plt.get_cmap('tab10')
    mask = np.zeros((Hf, Wf, 3), dtype=np.uint8)
    for i in range(kmeans.n_clusters):
        color = np.array(cmap(i)[:3]) * 255
        mask[labels_img == i] = color
        
    # Resize mask to original image size
    mask_img = Image.fromarray(mask).resize(img.size, resample=Image.NEAREST)
    mask_np = np.array(mask_img)
    img_np = np.array(img)
    
    # Blend
    overlay = (0.6 * img_np + 0.4 * mask_np).astype(np.uint8)
    Image.fromarray(overlay).save(out_path)
    print(f"Saved overlay to {out_path}")
    
    # Generate Charts
    base_name = out_path.replace(".png", "")
    return generate_charts(features_scaled, labels, kmeans, base_name)

def generate_charts(features, labels, kmeans, base_name):
    print("Generating analytics charts...")
    plt.style.use('dark_background')
    n_clusters = kmeans.n_clusters
    
    # 1. Legend
    plt.figure(figsize=(6, 2))
    cmap = plt.get_cmap('tab10')
    patches = [plt.Rectangle((0,0),1,1, color=cmap(i)) for i in range(n_clusters)]
    plt.legend(patches, [f"Cluster {i}" for i in range(n_clusters)], loc='center', ncol=3)
    plt.axis('off')
    plt.savefig(f"{base_name}_legend.png", bbox_inches='tight')
    plt.close()
    
    # 2. Distribution (Bar Chart)
    unique, counts = np.unique(labels, return_counts=True)
    plt.figure(figsize=(10, 6))
    plt.bar(unique, counts, color=[cmap(i) for i in unique])
    plt.title("Cluster Distribution")
    plt.xlabel("Cluster ID")
    plt.ylabel("Count")
    plt.xticks(unique)
    plt.savefig(f"{base_name}_distribution.png")
    plt.close()
    
    # 3. Pie Chart
    plt.figure(figsize=(8, 8))
    plt.pie(counts, labels=[f"Cluster {i}" for i in unique], autopct='%1.1f%%', colors=[cmap(i) for i in unique])
    plt.title("Cluster Share")
    plt.savefig(f"{base_name}_pie.png")
    plt.close()
    
    # Sample data for expensive operations (max 1000 points)
    n_samples = min(1000, len(features))
    indices = np.random.choice(len(features), n_samples, replace=False)
    X_sample = features[indices]
    y_sample = labels[indices]
    
    # 4. Silhouette Analysis
    try:
        silhouette_avg = silhouette_score(X_sample, y_sample)
        sample_silhouette_values = silhouette_samples(X_sample, y_sample)
        
        plt.figure(figsize=(10, 6))
        y_lower = 10
        for i in range(n_clusters):
            ith_cluster_values = sample_silhouette_values[y_sample == i]
            ith_cluster_values.sort()
            size_cluster_i = ith_cluster_values.shape[0]
            y_upper = y_lower + size_cluster_i
            color = cmap(i)
            plt.fill_betweenx(np.arange(y_lower, y_upper), 0, ith_cluster_values, facecolor=color, edgecolor=color, alpha=0.7)
            plt.text(-0.05, y_lower + 0.5 * size_cluster_i, str(i))
            y_lower = y_upper + 10
            
        plt.title(f"Silhouette Plot (Avg Score: {silhouette_avg:.2f})")
        plt.xlabel("Silhouette Coefficient Values")
        plt.ylabel("Cluster Label")
        plt.axvline(x=silhouette_avg, color="red", linestyle="--")
        plt.savefig(f"{base_name}_silhouette.png")
        plt.close()
    except Exception as e:
        print(f"Silhouette analysis failed: {e}")

    # Helper for plotting decision regions
    def plot_with_regions(X_2d, y, title, filename):
        plt.figure(figsize=(10, 8))
        
        try:
            # KNN for background regions
            knn = KNeighborsClassifier(n_neighbors=5)
            knn.fit(X_2d, y)
            
            # Meshgrid
            x_min, x_max = X_2d[:, 0].min() - 1, X_2d[:, 0].max() + 1
            y_min, y_max = X_2d[:, 1].min() - 1, X_2d[:, 1].max() + 1
            h = max((x_max - x_min)/100, (y_max - y_min)/100) # Dynamic step size
            xx, yy = np.meshgrid(np.arange(x_min, x_max, h), np.arange(y_min, y_max, h))
            
            # Predict
            Z = knn.predict(np.c_[xx.ravel(), yy.ravel()])
            Z = Z.reshape(xx.shape)
            
            # Plot contours
            plt.contourf(xx, yy, Z, alpha=0.2, cmap='tab10')
        except Exception as e:
            print(f"Region plot failed: {e}")

        # Plot points
        for i in unique:
            plt.scatter(X_2d[y == i, 0], X_2d[y == i, 1], c=[cmap(i)], label=f'Cluster {i}', alpha=0.9, edgecolor='w', linewidth=0.5)
            
        plt.title(title)
        plt.legend()
        plt.grid(True, linestyle='--', alpha=0.3)
        plt.savefig(filename)
        plt.close()

    # 5. PCA
    try:
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_sample)
        plot_with_regions(X_pca, y_sample, "PCA Visualization with Regions", f"{base_name}_pca.png")
    except Exception as e:
        print(f"PCA failed: {e}")

    # 6. t-SNE
    try:
        tsne = TSNE(n_components=2, perplexity=30, n_iter=1000, init='pca', learning_rate='auto')
        X_tsne = tsne.fit_transform(X_sample)
        plot_with_regions(X_tsne, y_sample, "t-SNE Visualization with Regions", f"{base_name}_tsne.png")
    except Exception as e:
        print(f"t-SNE failed: {e}")

    # 7. Heatmap (Cluster Centers)
    try:
        centers = kmeans.cluster_centers_
        plt.figure(figsize=(12, 8))
        sns.heatmap(centers, cmap='viridis', annot=False)
        plt.title("Cluster Centers Heatmap (Features)")
        plt.xlabel("Feature Index")
        plt.ylabel("Cluster ID")
        plt.savefig(f"{base_name}_heatmap.png")
        plt.close()
    except Exception as e:
        print(f"Heatmap failed: {e}")
        
    # Metrics Text
    stats = []
    with open(f"{base_name}_metrics.txt", "w") as f:
        f.write(f"Number of Clusters: {n_clusters}\n")
        f.write(f"Total Pixels/Patches: {len(features)}\n")
        if 'silhouette_avg' in locals():
            f.write(f"Silhouette Score (Sampled): {silhouette_avg:.4f}\n")
        
        f.write("\nCluster Distribution:\n")
        for i, count in zip(unique, counts):
            f.write(f"Cluster {i}: {count} ({count/len(features)*100:.1f}%)\n")
            stats.append({
                "label": f"Cluster {i}",
                "percentage": round(count/len(features)*100, 1),
                "color": matplotlib.colors.to_hex(cmap(i))
            })
            
    import json
    with open(f"{base_name}_stats.json", "w") as f:
        json.dump(stats, f)
            
    return stats
