#include <osmium/io/any_input.hpp>
#include <osmium/handler.hpp>
#include <osmium/visitor.hpp>
#include <osmium/osm/node.hpp>
#include <iostream>
#include <unordered_map>
#include <map>

class NodeHandler : public osmium::handler::Handler
{
public:
std::map<int, int> osm_nodes;
    void node(const osmium::Node &node)
    {
        if (node.location())
        {
            std::cout << "Node ID: " << node.id()
                      << " | Lat: " << node.location().lat()
                      << " | Lon: " << node.location().lon()
                      << " | Changeset " << node.changeset() << '\n';
            osm_nodes[node.changeset()] = node.id();
            
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
    return 0;
}
