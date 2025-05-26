from flask import Flask, jsonify
import boto3

app = Flask(__name__)

@app.route('/hello')
def hello():
    return {'message': 'Hello, world!'}

@app.route('/sns')
def list_sns_topics():
    client = boto3.client('sns')
    topics = []
    paginator = client.get_paginator('list_topics')
    for page in paginator.paginate():
        topics.extend(page.get('Topics', []))
    return jsonify({'topics': topics})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
