import pandas as pd

# Load the dataset
data = pd.read_csv('Crop_recommendation.csv')

# Display the first few rows of the dataset
print("Dataset Head:")
print(data.head())

# Check dataset information
print("\nDataset Info:")
print(data.info())

# Check for missing values
print("\nMissing Values:")
print(data.isnull().sum())
