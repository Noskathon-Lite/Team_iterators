import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import sys
import json

# Load the dataset
dataset = pd.read_csv('Crop_recommendation.csv')

# Preprocess the data
dataset = dataset.dropna()  # Drop rows with missing values if any
X = dataset[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]  # Features
y = dataset['label']  # Target variable (crop type)

# Train the model
model = DecisionTreeClassifier(random_state=42)
model.fit(X, y)

def predict_crop(data):
    # Use the input data to make a prediction
    input_data = pd.DataFrame(data)
    prediction = model.predict(input_data)
    return prediction[0]

if __name__ == "__main__":
    # Expecting input as a JSON string from the Node.js backend
    input_data = json.loads(sys.argv[1])
    predicted_crop = predict_crop(input_data)
    print(predicted_crop)  # Output the prediction to stdout
