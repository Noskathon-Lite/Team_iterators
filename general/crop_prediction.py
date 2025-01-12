import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import sys
import json
import joblib
import numpy as np

# Load the dataset for scaling reference
dataset = pd.read_csv('Crop_recommendation.csv')

# Preprocess the data
dataset = dataset.dropna()

# Create the feature matrix and target vector
X = dataset[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = dataset['label']

# Calculate min and max values for each feature for normalization
feature_mins = X.min()
feature_maxs = X.max()

# Train the model
model = DecisionTreeClassifier(random_state=42)
model.fit(X, y)

def normalize_input(data):
    """Normalize the input data based on the training dataset ranges"""
    normalized = {}
    for feature in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']:
        min_val = feature_mins[feature]
        max_val = feature_maxs[feature]
        value = float(data[feature])
        
        # Check if value is within reasonable bounds
        if value < min_val:
            print(f"Warning: {feature} value {value} is below minimum {min_val}", file=sys.stderr)
        elif value > max_val:
            print(f"Warning: {feature} value {value} is above maximum {max_val}", file=sys.stderr)
        
        normalized[feature] = value

    return normalized

def predict_crop(data):
    try:
        # Normalize the input data
        normalized_data = normalize_input(data)
        
        # Create DataFrame with features in correct order
        input_df = pd.DataFrame([normalized_data])[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        
        # Print input data for debugging
        print(f"Debug - Input data: {input_df.to_dict('records')[0]}", file=sys.stderr)
        
        # Make prediction
        prediction = model.predict(input_df)
        return prediction[0]
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
        predicted_crop = predict_crop(input_data)
        
        # Output prediction
        print(predicted_crop)
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)