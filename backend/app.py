from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import base64
from datetime import datetime
import json
from inference_sdk import InferenceHTTPClient

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('data', exist_ok=True)

# Roboflow API Configuration
ROBOFLOW_API_URL = "https://serverless.roboflow.com"
ROBOFLOW_API_KEY = "ZZJ9EYt7ZEpuiCbwbknz"
WORKSPACE_NAME = "basic-model-ohjas"
WORKFLOW_ID = "custom-workflow-4"

# Initialize Roboflow client
roboflow_client = InferenceHTTPClient(
    api_url=ROBOFLOW_API_URL,
    api_key=ROBOFLOW_API_KEY
)

# In-memory storage (replace with database in production)
lost_items = []
found_items = []

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_item_data(item_type, data):
    """Save item data to JSON file"""
    filename = f'data/{item_type}_items.json'
    try:
        with open(filename, 'r') as f:
            items = json.load(f)
    except FileNotFoundError:
        items = []
    
    items.append(data)
    
    with open(filename, 'w') as f:
        json.dump(items, f, indent=2)
    
    return items

def load_item_data(item_type):
    """Load item data from JSON file"""
    filename = f'data/{item_type}_items.json'
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def get_next_id(item_type):
    """Get the next unique ID for an item type"""
    items = load_item_data(item_type)
    if not items:
        return 1
    max_id = max(item.get('id', 0) for item in items)
    return max_id + 1

@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'message': 'VIT Pune Lost & Found API',
        'version': '1.0.0'
    })

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """
    Analyze uploaded image using Roboflow AI
    Expects: multipart/form-data with 'image' file
    Returns: AI detection results
    """
    try:
        # Check if image is present
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Run Roboflow AI workflow
        try:
            result = roboflow_client.run_workflow(
                workspace_name=WORKSPACE_NAME,
                workflow_id=WORKFLOW_ID,
                images={
                    "image": filepath
                },
                use_cache=True
            )
            
            # Extract predictions from result
            predictions = result.get('output', {})
            
            # Process predictions to extract useful information
            detected_objects = []
            if 'predictions' in predictions:
                for pred in predictions['predictions']:
                    detected_objects.append({
                        'class': pred.get('class', 'unknown'),
                        'confidence': pred.get('confidence', 0),
                        'bbox': pred.get('bbox', {})
                    })
            
            return jsonify({
                'success': True,
                'filename': filename,
                'filepath': filepath,
                'analysis': {
                    'detected_objects': detected_objects,
                    'raw_result': result
                },
                'timestamp': timestamp
            })
        
        except Exception as e:
            return jsonify({
                'error': 'AI analysis failed',
                'details': str(e),
                'filename': filename,
                'filepath': filepath
            }), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/report-lost', methods=['POST'])
def report_lost():
    """
    Report a lost item
    Expects: JSON with item details and optional image
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['itemName', 'category', 'location', 'date', 'contactInfo']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create lost item entry
        lost_item = {
            'id': get_next_id('lost'),
            'itemName': data['itemName'],
            'category': data['category'],
            'color': data.get('color', ''),
            'location': data['location'],
            'date': data['date'],
            'description': data.get('description', ''),
            'contactInfo': data['contactInfo'],
            'image': data.get('image', ''),
            'status': 'active',
            'reportedAt': datetime.now().isoformat(),
            'aiAnalysis': data.get('aiAnalysis', {})
        }
        
        # Save to storage
        lost_items.append(lost_item)
        save_item_data('lost', lost_item)
        
        return jsonify({
            'success': True,
            'message': 'Lost item reported successfully',
            'item': lost_item
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/report-found', methods=['POST'])
def report_found():
    """
    Report a found item
    Expects: JSON with item details and optional image
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['itemName', 'category', 'location', 'date', 'contactInfo']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create found item entry
        found_item = {
            'id': get_next_id('found'),
            'itemName': data['itemName'],
            'category': data['category'],
            'color': data.get('color', ''),
            'location': data['location'],
            'date': data['date'],
            'description': data.get('description', ''),
            'contactInfo': data['contactInfo'],
            'image': data.get('image', ''),
            'status': 'available',
            'reportedAt': datetime.now().isoformat(),
            'aiAnalysis': data.get('aiAnalysis', {})
        }
        
        # Save to storage
        found_items.append(found_item)
        save_item_data('found', found_item)
        
        return jsonify({
            'success': True,
            'message': 'Found item reported successfully',
            'item': found_item
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items/lost', methods=['GET'])
def get_lost_items():
    """Get all lost items with optional filters"""
    try:
        # Load from storage
        all_lost_items = load_item_data('lost')
        
        # Apply filters
        category = request.args.get('category')
        color = request.args.get('color')
        location = request.args.get('location')
        search = request.args.get('search', '').lower()
        
        filtered_items = all_lost_items
        
        if category:
            filtered_items = [item for item in filtered_items if item.get('category') == category]
        
        if color:
            filtered_items = [item for item in filtered_items if item.get('color', '').lower() == color.lower()]
        
        if location:
            filtered_items = [item for item in filtered_items if location.lower() in item.get('location', '').lower()]
        
        if search:
            filtered_items = [
                item for item in filtered_items
                if search in item.get('itemName', '').lower() or 
                   search in item.get('description', '').lower()
            ]
        
        return jsonify({
            'success': True,
            'count': len(filtered_items),
            'items': filtered_items
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items/found', methods=['GET'])
def get_found_items():
    """Get all found items with optional filters"""
    try:
        # Load from storage
        all_found_items = load_item_data('found')
        
        # Apply filters
        category = request.args.get('category')
        color = request.args.get('color')
        location = request.args.get('location')
        search = request.args.get('search', '').lower()
        
        filtered_items = all_found_items
        
        if category:
            filtered_items = [item for item in filtered_items if item.get('category') == category]
        
        if color:
            filtered_items = [item for item in filtered_items if item.get('color', '').lower() == color.lower()]
        
        if location:
            filtered_items = [item for item in filtered_items if location.lower() in item.get('location', '').lower()]
        
        if search:
            filtered_items = [
                item for item in filtered_items
                if search in item.get('itemName', '').lower() or 
                   search in item.get('description', '').lower()
            ]
        
        return jsonify({
            'success': True,
            'count': len(filtered_items),
            'items': filtered_items
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items/<item_type>/<int:item_id>', methods=['GET'])
def get_item_details(item_type, item_id):
    """Get details of a specific item"""
    try:
        if item_type not in ['lost', 'found']:
            return jsonify({'error': 'Invalid item type'}), 400
        
        items = load_item_data(item_type)
        item = next((item for item in items if item['id'] == item_id), None)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        return jsonify({
            'success': True,
            'item': item
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/match-items', methods=['POST'])
def match_items():
    """
    Match a lost item with potentially found items using AI
    Expects: JSON with lost item details or AI analysis
    """
    try:
        data = request.get_json()
        
        # Get AI analysis from request
        ai_analysis = data.get('aiAnalysis', {})
        category = data.get('category', '')
        color = data.get('color', '')
        
        # Load all found items
        all_found_items = load_item_data('found')
        
        # Simple matching algorithm (can be enhanced with ML)
        matches = []
        for found_item in all_found_items:
            score = 0
            
            # Category match
            if found_item.get('category') == category:
                score += 40
            
            # Color match
            if color and found_item.get('color', '').lower() == color.lower():
                score += 30
            
            # AI object detection match
            if ai_analysis and found_item.get('aiAnalysis'):
                # Compare detected objects
                detected_classes = [obj.get('class') for obj in ai_analysis.get('detected_objects', [])]
                found_classes = [obj.get('class') for obj in found_item.get('aiAnalysis', {}).get('detected_objects', [])]
                
                common_objects = set(detected_classes) & set(found_classes)
                if common_objects:
                    score += len(common_objects) * 15
            
            # Add to matches if score is above threshold
            if score >= 30:
                matches.append({
                    'item': found_item,
                    'matchScore': score,
                    'matchReasons': []
                })
        
        # Sort by match score
        matches.sort(key=lambda x: x['matchScore'], reverse=True)
        
        return jsonify({
            'success': True,
            'matchCount': len(matches),
            'matches': matches[:10]  # Return top 10 matches
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/uploads/<filename>')
def serve_upload(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get platform statistics"""
    try:
        lost_count = len(load_item_data('lost'))
        found_count = len(load_item_data('found'))
        
        return jsonify({
            'success': True,
            'stats': {
                'totalLostItems': lost_count,
                'totalFoundItems': found_count,
                'activeUsers': 5000,  # Mock data
                'itemsReunited': 12500,  # Mock data
                'successRate': 95  # Mock data
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting VIT Pune Lost & Found Backend...")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Roboflow API configured: {ROBOFLOW_API_URL}")
    app.run(debug=True, host='0.0.0.0', port=5000)
