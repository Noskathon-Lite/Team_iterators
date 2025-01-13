import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import sys
import json

# Load and preprocess the dataset
dataset = pd.read_csv('Crop_recommendation.csv')
dataset = dataset.dropna()

# Create feature matrix X and target vector y
X = dataset[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = dataset['label']

# Scale the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train KNN model for finding nearest neighbors
n_neighbors = 10  # Increased number of neighbors to consider
knn = NearestNeighbors(n_neighbors=n_neighbors)
knn.fit(X_scaled)

def normalize_input(data):
    """Normalize the input data and track which features are within valid ranges"""
    normalized = {}
    valid_features = []
    
    for feature in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
        value = float(data[feature])
        normalized[feature] = value
        
        # Check if value is within reasonable range (±20% of min-max range)
        min_val = X[feature].min()
        max_val = X[feature].max()
        range_buffer = (max_val - min_val) * 0.2  # 20% buffer
        
        if min_val - range_buffer <= value <= max_val + range_buffer:
            valid_features.append(feature)
        else:
            print(f"Warning: {feature} value {value} is outside normal range [{min_val}, {max_val}]", 
                  file=sys.stderr)
    
    return normalized, valid_features

def predict_crop(data):
    try:
        # Normalize the input data and get valid features
        normalized_data, valid_features = normalize_input(data)
        
        # Create input array and scale it
        input_features = pd.DataFrame([normalized_data])[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        input_scaled = scaler.transform(input_features)
        
        # Find k nearest neighbors
        distances, indices = knn.kneighbors(input_scaled)
        
        # Get the crops for nearest neighbors
        neighbor_crops = y.iloc[indices[0]]
        
        # Calculate feature-specific distances for each neighbor
        feature_distances = []
        for idx in indices[0]:
            dist_dict = {}
            for feature in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
                dist = abs(X[feature].iloc[idx] - normalized_data[feature]) / (X[feature].max() - X[feature].min())
                dist_dict[feature] = dist
            feature_distances.append(dist_dict)
        
        # Weight calculation considering valid features
        weights = []
        for dist_dict in feature_distances:
            # Calculate average distance for valid features only
            valid_distances = [dist_dict[f] for f in valid_features]
            avg_valid_distance = np.mean(valid_distances) if valid_distances else float('inf')
            weight = 1 / (avg_valid_distance + 1e-6)
            weights.append(weight)
        
        weights = np.array(weights)
        weights = weights / np.sum(weights)  # Normalize weights
        
        # Count weighted votes for each crop
        crop_votes = {}
        confidence_scores = {}
        
        for crop, weight, dist_dict in zip(neighbor_crops, weights, feature_distances):
            crop_votes[crop] = crop_votes.get(crop, 0) + weight
            
            # Calculate confidence score based on matching features
            matching_features = sum(1 for f in valid_features if dist_dict[f] < 0.2)  # 20% threshold
            confidence = (matching_features / len(valid_features)) * 100 if valid_features else 0
            
            if crop not in confidence_scores or confidence > confidence_scores[crop]:
                confidence_scores[crop] = confidence
        
        # Sort crops by votes
        sorted_crops = sorted(crop_votes.items(), key=lambda x: x[1], reverse=True)
        
        # Prepare recommendations with confidence levels
        recommendations = []
        for crop, votes in sorted_crops[:3]:  # Top 3 recommendations
            confidence = confidence_scores[crop]
            if confidence >= 30:  # Only include crops with at least 30% confidence
                recommendations.append({
                    'crop': crop,
                    'confidence': round(confidence, 1),
                    'matching_features': sum(1 for f in valid_features if any(
                        feature_distances[i][f] < 0.2 for i, c in enumerate(neighbor_crops) if c == crop
                    ))
                })
        
        # Debug information
        print(f"Debug - Valid features: {valid_features}", file=sys.stderr)
        print(f"Debug - Recommendations: {recommendations}", file=sys.stderr)
        
        # Return recommendations as JSON string
        if recommendations:
            return json.dumps(recommendations)
        else:
            return json.dumps([{"crop": "No suitable crops found", "confidence": 0, "matching_features": 0}])
            
    except Exception as e:
        print(f"Error in predict_crop: {str(e)}", file=sys.stderr)
        raise

if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            raise ValueError("Expected one argument with input data")
        
        # Parse input JSON from command line
        input_data = json.loads(sys.argv[1])
        
        # Debug: Print received input
        print(f"Debug - Received input: {input_data}", file=sys.stderr)
        
        # Get prediction
        predictions = predict_crop(input_data)
        
        # Output predictions
        print(predictions)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)