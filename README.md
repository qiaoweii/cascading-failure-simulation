# cascading-failure-simulation

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
   conda activate myenv
```

3. Verify that the new environment was installed correctly:

```bash
   conda env list
```

ref: [create-an-environment-from-an-environment-yml-file](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-from-an-environment-yml-file)

### 2.2 Fetch data and run project

There are two methods can fetched data from backend to frontend.

Method 1. Use fake data stored in `network.json` file. (Used currently)

The fake data includes the nodes and lines infomation in each round of cascading failure process.

- Each round has an "id" to identify it, all nodes grouped as an array and all lines grouped as an array.
- Each node has an "id" to identify it. For the value of "type", "0" stands for "bus", "1" stands for "generator", "1" stands for "load".
- Each line has an "id" to identify it. The "source" stands for the "from_bus" value in pandapower network. The "target" stands for the "to_bus" value. And the "value" stands for the "length_km".

You can use "npm start" to run the project.

Method 2. Use axios and flask. (This feature will be completed in the future.)

In this case, `network_simulation.py` is used to format data. `http_service.py` acts as the interface to transfer the data between the frontend and the backend.

So far, it is guaranteed that network's name can be transfered to the backend, the target network's information can be transferred to the frontend.

The axios part in the front end is commented. If you want to run and test, just uncomment this part of code in `network_animation.js`(line 30-53) and use the command 'python3 http_service.py'.

## 3 Other Information

The port for backend server is 5000 by default.  
The frontend project is running on http://localhost:8080 by default.
