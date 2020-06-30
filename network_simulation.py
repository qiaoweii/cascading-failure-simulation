import pandapower.networks


def create_net(network_Name):
    if network_Name == "ieee-9":
        return pandapower.networks.case9()
    elif network_Name == "ieee-14":
        return pandapower.networks.case14()
    elif network_Name == "ieee-30":
        return pandapower.networks.case30()

    return pandapower.networks.case5()


def get_buses_data(net):
    gens = set()

    for i in net.gen.index:
        gens.add(int(net.gen[net.gen.index == i].bus))

    loads = set()

    for i in net.load.index:
        loads.add(int(net.load[net.load.index == i].bus))

    all_bus_data = []
    for i in net.bus.index:
        bus_type = "0"
        if i in gens:
            bus_type = "1"
        if i in loads:
            bus_type = "2"
        data = {"id": str(int(i)), "type": str(bus_type)}
        all_bus_data.append(data)

    return all_bus_data


def get_lines_data(net):
    all_line_data = []
    for i in net.line.index:
        l = net.line[net.line.index == i]
        data = {"source": str(int(l.from_bus)), "target": str(int(
            l.to_bus)), "value": float(l.length_km)}
        all_line_data.append(data)
    return all_line_data


def collect_data(network_Name):

    net = create_net(network_Name)

    # Run simulation algorithm and get data at each round here.
    data = simulate_cascading_failure(net)

    return data


def simulate_cascading_failure(net):
    # load bus data
    all_bus_data = get_buses_data(net)
    # load line data
    all_line_data = get_lines_data(net)

    all_data = {"nodes": all_bus_data, "lines": all_line_data}
    return all_data


# Optional Method: Export data to a JSON file.

# import json
# import os

# net = pandapower.networks.case9()


# def export_network_to_json(net, export_folder, failuer_lines):

#     if not os.path.isdir(export_folder):
#         print("Directory {} does not exist, create it".format(export_folder))
#         os.mkdir(export_folder)

#     if failuer_lines is None:
#         print("The network is balanced now.")
#         failure_lines = net.line

#     all_line_data = []

#     for i in net.line.index:
#         l = net.line[net.line.index == i]
#         data = {"index": int(i), "from_bus": int(l.from_bus), "to_bus": int(l.to_bus), "length_km": float(l.length_km)}
#         all_line_data.append(data)

#     with open(export_folder + '/lines.json', 'w') as fp:
#         json.dump(all_line_data, fp)

#     all_bus_data = []

#     for i in net.bus.index:
#         # print(i)
#         # print(net.bus[net.bus.index == i])
#         b = net.bus[net.bus.index == i]
#         data = {"index": int(i)}
#         all_bus_data.append(data)

#     with open(export_folder + '/buses.json', 'w') as fp:
#         json.dump(all_bus_data, fp)


# export_network_to_json(net, '/Users/zhengqiaowei/project/CascadingFailureSimulation', net.line)
