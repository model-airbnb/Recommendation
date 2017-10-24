# Model Airbnb: Recommendation

This is the Recommendtion Service for Model AirBnb. It takes into account information from User Behavior, Inventory and Search and provides recommendations on how to price future properties. These recommendation are used by Search to sort Search Results.

The recommendations service consumes messages from search query (Search query lets analytics know which searches were actually performed to get the search results), search results (Search results are consumed to see what results are actually being published after the weights, and whether those do lead to purchases) and booking details (booking details are provided when a booking is performed. The booking is consumed by Inventory, and Inventory adds on additional values related to the listing).

The recommendations servive publishes messages that has recommendation weights for the serach service. The sort order scores are used by the search service to sort search results.


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

# Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)

## Usage

> Some usage instructions

## Requirements

- Node 6.9.x
- Postgresql 9.6.x
- Amazon SQS
- Elastic Search
- Kibana

## Other Information

(TODO: fill this out with details about your project. Suggested ideas: architecture diagram, schema, and any other details from your app plan that sound interesting.)

