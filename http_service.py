from network_simulation import *
from flask import Flask, jsonify, render_template
from flask_cors import CORS

# configuration
DEBUG = True
# TESTING = True

# instantiate the app
app = Flask(__name__,
            static_folder='static',
            template_folder='templates')
app.config.from_object(__name__)

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})

# sanity check route


@app.route("/")
def home():
    return render_template('index.html')


@app.route('/get_data', methods=['GET'])
def get_data():
    all_data = collect_data()
    return jsonify(all_data)


if __name__ == '__main__':
    app.run()
