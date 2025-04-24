#include <osmium/io/any_input.hpp>
#include <osmium/handler.hpp>
#include <osmium/visitor.hpp>
#include <osmium/osm/node.hpp>
#include <iostream>
#include <unordered_map>
#include <map>
#include <vector>
#include <tuple>
#include <fstream>
class NodeHandler : public osmium::handler::Handler
{
public:
//std::map<int, std::vector<std::tuple<int, double, double>>> osm_nodes;
std::unordered_map<osmium::object_id_type, std::pair<double, double>> osm_nodes_map;
std::unordered_map<osmium::object_id_type, std::vector<osmium::object_id_type>> osm_ways_map;
    void node(const osmium::Node &node)
    {
        if (node.location())
        {
            // Store the node information in a map with node id as key
            osm_nodes_map[node.id()] = {node.location().lat(), node.location().lon()};
        }
    }
    void way(const osmium::Way &way)
    {
        // Store the way information in a map with way id as key
        std::vector<osmium::object_id_type> node_ids;
        for (const auto &node_ref : way.nodes())
        {
            node_ids.push_back(node_ref.ref());
        }
        osm_ways_map[way.id()] = node_ids;

    }
};

void write_way_to_file(const std::vector<osmium::object_id_type>& node_ids,
    const std::unordered_map<osmium::object_id_type,
                             std::pair<double,double>>& node_map,
    const std::string&      out_file)
{
std::ofstream out(out_file);          // truncates if file exists
if (!out) {
std::cerr << "Cannot open '" << out_file << "' for writing\n";
return;
}
// header row (optional)
out << "lat,lon\n";

for (auto nid : node_ids) {
auto it = node_map.find(nid);
if (it != node_map.end()) {
out << it->second.first  << ','       // lat
<< it->second.second << '\n';      // lon
}
}
std::cout << "Wrote " << node_ids.size() << " points → " << out_file << '\n';
}

int main(int argc, char *argv[])
{

    if (argc != 3)
    {
        std::cerr << "Usage: ./osm_reader <osmfile.pbf> <way_id>\n";
        return 1;
    }

    // parse command line arguements
    osmium::io::Reader reader(argv[1]);
    const char* way_str = argv[2];

    // read through the .osm file
    NodeHandler handler;
    osmium::apply(reader, handler);
    reader.close();

    // parse way id
    char* endptr = nullptr;
    osmium::object_id_type way_id = static_cast<osmium::object_id_type>(
        std::strtoll(way_str, &endptr, 10)
    );
    if (*endptr != '\0') {
        std::cerr << "Invalid way id: " << way_str << '\n';
        return 1;
    }

    // process way id into csv
    int way_ID = way_id;
    auto it = handler.osm_ways_map.find(way_ID);
    if (it != handler.osm_ways_map.end()) {
        std::string filename = "way_" + std::to_string(way_ID) + ".csv";
        write_way_to_file(it->second, handler.osm_nodes_map, filename);
        for (const auto& node_id : it->second) {
            auto node_it = handler.osm_nodes_map.find(node_id);
            if (node_it != handler.osm_nodes_map.end()) {
                const auto& [lat, lon] = node_it->second;
            } else {
                std::cout << "  Node ID: " << node_id << " (location not found)\n";
            }
        }
    } else {
        std::cout << "Way ID " << way_ID << " not found.\n";
    }
    
    
    return 0;
}