# Cascading-Failure-Simulation

## 1 About

The target of this project is to convert cascading failure simuation results to an iteractive web animation.

This project is built primarily in JavaScript using the D3.js.

## 2 How to use it

### 2.1 Set up environment by miniconda

1. Create the environment from the `environment.yml` file:

```bash
conda env create -f environment.yml
```

2. Activate the new environment:

```bash
   conda activate sim
```

3. Verify that the new environment was installed correctly:

```bash
   conda env list
```

ref: [create-an-environment-from-an-environment-yml-file](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-from-an-environment-yml-file)

### 2.2 Set up webpack

```bash
   npm install webpack-dev-server -g
```

```bash
   npm install --save-dev webpack
```

```bash
   npm i -g webpack webpack-cli
```

### 2.3 Fetch data and run project

There are two methods can fetched data from backend to frontend.

#### Method 1. Use fake data stored in `network.json` file. (Used currently)

The fake data includes the nodes' and lines' infomation in each round of cascading failure process.

- Each round has an "id" to identify it. All nodes are grouped as an array. The same to the lines.
- Each node has two attributes, "id" and "type". "id" is used to identify the node. The value of "type", "0" stands for "bus", "1" stands for "generator", "2" stands for "load".
- Each line has four attributes, "id", "source", "target", "value". An "id" is used to identify a line. The "source" stands for the "from_bus" value in pandapower network. The "target" stands for the "to_bus". The "value" stands for the "length_km".

You can use "npm start" to run the project.

#### Method 2. Use axios and flask. (This feature will be completed in the future.)

In this case, `network_simulation.py` is used to run simulation algorithm and format data. `http_service.py` acts as the interface to transfer the data between the frontend and the backend.

So far, it is guaranteed that network's name can be transfered to the backend, the target network's information can be transferred to the frontend.

The axios part in the front end is commented. If you want to run and test, just uncomment this part of code in `network_animation.js`(line 30-53) and use the command 'python3 http_service.py'.

## 3 Other Information

The port for backend server is `5000` by default.

The frontend project is running on http://localhost:8080 by default.
