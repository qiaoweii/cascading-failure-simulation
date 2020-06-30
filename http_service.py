from network_simulation import *
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

# configuration
DEBUG = True
TESTING = True

# instantiate the app
app = Flask(__name__,
            static_folder='static',
            template_folder='templates')
app.config.from_object(__name__)

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})

default_port = 5000
default_network_name = "ieee5"


@app.route('/get_data', methods=['GET', 'POST'])
def get_data():
    if request.method == "POST":
        data = request.get_json(silent=True)
        network_name = data.get("name")
        if (network_name == "ieee-9") or (network_name == "ieee-5") or (network_name == "ieee-14") or (network_name == "ieee-30"):
            return collect_data(network_name)
        else:
            error = "Invalid Input"
            return error

    return collect_data(default_network_name)


if __name__ == '__main__':
    app.run(port=default_port)
