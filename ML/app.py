from flask import Flask, render_template, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
from interface import run_inference
import os
import base64
import uuid
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.template_folder = 'templates'

# Ensure static folder exists
STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
os.makedirs(STATIC_FOLDER, exist_ok=True)

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "clusters_k6.joblib")

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(STATIC_FOLDER, filename)

@app.route("/predict", methods=["POST"])
def predict():
    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "No file uploaded"}), 400

    # Generate unique filename to avoid conflicts
    unique_id = str(uuid.uuid4())
    filename = f"{unique_id}_{file.filename}"
    input_path = os.path.join(STATIC_FOLDER, filename)
    file.save(input_path)

    output_filename = f"{unique_id}_output.png"
    output_path = os.path.join(STATIC_FOLDER, output_filename)

    try:
        stats = run_inference(
            image_path=input_path,
            model_path=MODEL_PATH,
            out_path=output_path
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    base_name = output_filename.replace(".png", "")
    
    # Construct response with URLs
    # The frontend will prepend the base URL, so we send relative paths or paths starting with /static
    response_data = {
        'overlay_url': f"/static/{output_filename}",
        'legend_url': f"/static/{base_name}_legend.png",
        'distribution_url': f"/static/{base_name}_distribution.png",
        'pie_url': f"/static/{base_name}_pie.png",
        'silhouette_url': f"/static/{base_name}_silhouette.png",
        'pca_url': f"/static/{base_name}_pca.png",
        'tsne_url': f"/static/{base_name}_tsne.png",
        'heatmap_url': f"/static/{base_name}_heatmap.png",
        'elbow_url': f"/static/{base_name}_elbow.png",
        'metrics_url': f"/static/{base_name}_metrics.txt",
        'cluster_stats': stats
    }
    
    # Also read metrics content to send directly if needed
    metrics_path = os.path.join(STATIC_FOLDER, f"{base_name}_metrics.txt")
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            response_data['metrics_text'] = f.read()

    return jsonify(response_data)

@app.route("/history", methods=["GET"])
def history():
    items = []
    if not os.path.exists(STATIC_FOLDER):
        return jsonify({'items': []})
        
    # List all files in static folder
    files = os.listdir(STATIC_FOLDER)
    # Filter for output files: ends with _output.png
    output_files = [f for f in files if f.endswith('_output.png')]
    
    # Sort by creation time (newest first)
    output_files.sort(key=lambda x: os.path.getmtime(os.path.join(STATIC_FOLDER, x)), reverse=True)
    
    import json
    for f in output_files:
        unique_id = f.split('_')[0]
        filepath = os.path.join(STATIC_FOLDER, f)
        timestamp = os.path.getmtime(filepath)
        date_str = datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        
        base_name = f.replace(".png", "")
        stats_path = os.path.join(STATIC_FOLDER, f"{base_name}_stats.json")
        stats = []
        if os.path.exists(stats_path):
            try:
                with open(stats_path, 'r') as json_file:
                    stats = json.load(json_file)
            except:
                pass

        analytics = {
            'legend_url': f"/static/{base_name}_legend.png",
            'distribution_url': f"/static/{base_name}_distribution.png",
            'pie_url': f"/static/{base_name}_pie.png",
            'silhouette_url': f"/static/{base_name}_silhouette.png",
            'pca_url': f"/static/{base_name}_pca.png",
            'tsne_url': f"/static/{base_name}_tsne.png",
            'heatmap_url': f"/static/{base_name}_heatmap.png",
            'elbow_url': f"/static/{base_name}_elbow.png",
            'metrics_url': f"/static/{base_name}_metrics.txt",
            'cluster_stats': stats
        }
        
        items.append({
            'id': unique_id,
            'thumbnail_url': f"/static/{f}",
            'created_at': date_str,
            'file_name': f"Analysis {unique_id[:8]}",
            'overlay_url': f"/static/{f}",
            'analytics': analytics
        })
        
    return jsonify({'items': items})

@app.route("/save_result", methods=["POST"])
def save_result():
    # Since files are already saved in static, we just acknowledge.
    return jsonify({"status": "success"})

@app.route("/delete_history/<unique_id>", methods=["DELETE"])
def delete_history_item(unique_id):
    if not os.path.exists(STATIC_FOLDER):
        return jsonify({"status": "success"}) # Nothing to delete
        
    try:
        files = os.listdir(STATIC_FOLDER)
        deleted_count = 0
        for f in files:
            if f.startswith(unique_id):
                os.remove(os.path.join(STATIC_FOLDER, f))
                deleted_count += 1
                
        return jsonify({"status": "success", "message": f"Deleted {deleted_count} files"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/stats", methods=["GET"])
def get_stats():
    if not os.path.exists(STATIC_FOLDER):
        return jsonify({"accuracy": "--", "images_processed": 0, "materials_detected": 0})
        
    try:
        files = os.listdir(STATIC_FOLDER)
        output_files = [f for f in files if f.endswith('_output.png')]
        stats_files = [f for f in files if f.endswith('_stats.json')]
        
        images_processed = len(output_files)
        
        # Calculate Total Carbon Saved
        total_carbon = 0.0
        
        for sf in stats_files:
            try:
                with open(os.path.join(STATIC_FOLDER, sf), 'r') as f:
                    data = json.load(f)
                    # Find dominant
                    if data:
                        dominant = max(data, key=lambda x: x['percentage'])
                        # Same formula as frontend: percentage * 0.12
                        saved = dominant['percentage'] * 0.12
                        total_carbon += saved
            except:
                pass
                
        carbon_display = f"{total_carbon:.2f} kg"
        
        # Materials detected (fixed for this model + dynamic count if possible)
        materials_detected = 10 
        
        return jsonify({
            "accuracy": carbon_display, # Reuse key to avoid breaking frontend immediately/simpler change
            "label_1": "CO2 Saved",     # Send label to be flexible
            "images_processed": images_processed, 
            "materials_detected": materials_detected
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files.get("file")
        if not file or file.filename == "":
            return "No file uploaded!"

        input_path = "uploaded.jpg"
        file.save(input_path)

        output_path = "output.png"

        run_inference(
            image_path=input_path,
            model_path=MODEL_PATH,
            out_path=output_path
        )

        # Read all generated files
        visualizations = {}
        base_name = output_path.replace(".png", "")
        
        viz_files = {
            'overlay': output_path,
            'legend': f"{base_name}_legend.png",
            'distribution': f"{base_name}_distribution.png",
            'pie': f"{base_name}_pie.png",
            'silhouette': f"{base_name}_silhouette.png",
            'pca': f"{base_name}_pca.png",
            'tsne': f"{base_name}_tsne.png",
            'heatmap': f"{base_name}_heatmap.png",
            'elbow': f"{base_name}_elbow.png"
        }
        
        for key, filepath in viz_files.items():
            if os.path.exists(filepath):
                with open(filepath, 'rb') as f:
                    visualizations[key] = base64.b64encode(f.read()).decode('utf-8')
        
        # Read metrics
        metrics_path = f"{base_name}_metrics.txt"
        metrics_text = ""
        if os.path.exists(metrics_path):
            with open(metrics_path, 'r') as f:
                metrics_text = f.read()

        return render_template('results.html', 
                             visualizations=visualizations,
                             metrics=metrics_text)

    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Waste Image Clustering - ML Analytics</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                padding: 50px;
                max-width: 600px;
                width: 100%;
                text-align: center;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 2.5em;
            }
            .subtitle {
                color: #666;
                margin-bottom: 40px;
                font-size: 1.1em;
            }
            .upload-area {
                border: 3px dashed #667eea;
                border-radius: 15px;
                padding: 40px;
                margin: 30px 0;
                transition: all 0.3s ease;
                background: #f8f9fe;
                cursor: pointer;
            }
            .upload-area:hover {
                border-color: #764ba2;
                background: #f0f2f9;
                transform: translateY(-2px);
            }
            input[type="file"] {
                display: none;
            }
            label {
                display: block;
                cursor: pointer;
            }
            .icon {
                font-size: 4em;
                color: #667eea;
                margin-bottom: 15px;
            }
            button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 15px 40px;
                font-size: 1.1em;
                border-radius: 30px;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 10px 20px rgba(118, 75, 162, 0.3);
            }
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 30px rgba(118, 75, 162, 0.4);
            }
            button:active {
                transform: translateY(0);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Waste Vision AI</h1>
            <div class="subtitle">Advanced Clustering & Segmentation Analysis</div>
            
            <form action="/" method="post" enctype="multipart/form-data">
                <div class="upload-area">
                    <input type="file" name="file" id="file" accept="image/*" onchange="showFileName()">
                    <label for="file">
                        <div class="icon">📸</div>
                        <div style="font-size: 1.2em; font-weight: bold; color: #444;">Upload Image</div>
                        <div style="color: #888; margin-top: 5px;">Click to browse</div>
                    </label>
                    <div id="filename" style="margin-top: 15px; color: #667eea; font-weight: bold;"></div>
                </div>
                <button type="submit">Run Analysis</button>
            </form>
        </div>

        <script>
            function showFileName() {
                const input = document.getElementById('file');
                const display = document.getElementById('filename');
                if (input.files.length > 0) {
                    display.textContent = "Selected: " + input.files[0].name;
                }
            }
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(debug=True, port=5000)
