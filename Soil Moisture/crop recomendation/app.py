from flask import Flask, request, jsonify, render_template
import requests
import pandas as pd

app = Flask(__name__, template_folder='templates', static_folder='static')

API_KEY = 'ae0f2a67280e292d745034e98a0b59bd'
data = pd.read_csv('./Crop_recommendation.csv')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/recommend_crop', methods=['POST'])
def recommend_crop():
    location = request.json.get('location')
    if not location:
        return jsonify({"error": "Location is required"}), 400

    weather_data = get_weather_data(location)
    if not weather_data:
        return jsonify({"error": "Could not fetch weather data"}), 400

    temperature = weather_data['main']['temp']
    humidity = weather_data['main']['humidity']

    recommended_crops = suggest_crops(temperature, humidity)
    return jsonify({'recommended_crops': recommended_crops})

def get_weather_data(location):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None

def suggest_crops(temperature, humidity):
    recommended_crops = []
    for _, row in data.iterrows():
        temp_min = row['temperature'] - 2
        temp_max = row['temperature'] + 2
        humidity_min = row['humidity'] - 5
        humidity_max = row['humidity'] + 5

        if temp_min <= temperature <= temp_max and humidity_min <= humidity <= humidity_max:
            recommended_crops.append(row['label'])
    return list(set(recommended_crops))

if __name__ == '__main__':
    app.run(debug=True)