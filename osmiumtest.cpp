#include <osmium/io/any_input.hpp>
#include <osmium/handler.hpp>
#include <osmium/visitor.hpp>
#include <osmium/osm/node.hpp>
#include <iostream>
#include <unordered_map>
#include <map>
#include <vector>
#include <tuple>
class NodeHandler : public osmium::handler::Handler
{
public:
std::map<int, std::vector<std::tuple<int, double, double>>> osm_nodes;
    void node(const osmium::Node &node)
    {
        if (node.location())
        {
            std::cout << "Node ID: " << node.id()
                      << " | Lat: " << node.location().lat()
                      << " | Lon: " << node.location().lon()
                      << " | Changeset " << node.changeset() << '\n';
            // Store the node information in a map with changeset ID as key
            auto node_info = std::make_tuple(node.id(), node.location().lat(), node.location().lon());
            osm_nodes[node.changeset()].push_back(node_info);
        }
    }
};

int main(int argc, char *argv[])
{

    if (argc != 2)
    {
        std::cerr << "Usage: ./osm_reader <osmfile.pbf>\n";
        return 1;
    }

    osmium::io::Reader reader(argv[1]);

    NodeHandler handler;
    osmium::apply(reader, handler);

    reader.close();
    const auto& node_map = handler.osm_nodes;
    std::cout << "Number of changesets: " << node_map.size() << '\n';
    int changeset_id;
    std::cout << "Enter changeset ID to get nodes: ";
    std::cin >> changeset_id;
    auto it = node_map.find(changeset_id);
    if (it != node_map.end()) {
        const auto& nodes = it->second;
        std::cout << "Nodes in changeset " << changeset_id << ":\n";
        for (const auto& [node_id, lat, lon] : nodes) {
            std::cout << "  Node ID: " << node_id
                      << " | Lat: " << lat
                      << " | Lon: " << lon << '\n';
        }
    } else {
        std::cout << "No nodes found for changeset ID: " << changeset_id << '\n';
    }
    
    
    return 0;
}