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

To install, run the following commands. Make sure to update the proper locations for Elastic Search, Postgres, Redis, and SQS Services.

```
npm install
```

## Requirements

- aws-sdk 2.141.0
- body-parser 1.17.0
- elasticsearch 13.3.1
- express 4.15.0
- pg 7.3.0
- redis 2.8.0
- winston 3.0.0-rc1
- winston-elasticsearch 0.5.3

## System Service Architecture

![System Service Architecture](https://github.com/model-airbnb/Recommendation/blob/master/docs/images/image2.jpg "System Service Architecture")

<img src="./docs/images/image2.png">

## Messages Consumed

### Search Query (from Search Service)
Search query lets analytics know which searches were actually performed to get the search results. The weights used will be seen here.

Property | Description | Required
---------|-------------|----------
Search Query ID | TBD range | yes
User ID | (coordinate range with Behaviour) | yes
Market ID | Identifier for destination being searched | yes
Check-in | date | yes
Check-out | date | yes
Room Type | string | no
Amenities | List of amenity IDs | no
Neighbourhood ID | TBD range | no

### Search Results (from Search Service)
Search results are consumed to see what results are actually being published after the weights, and whether those do lead to purchases. 

Property | Possible Values | Required
---------|-----------------|----------
Search Query ID | TBD range | yes
Available Listings | Sorted list of listings provided to the client in response to a search query | yes
Listing ID | Identifier for the listing | yes
Neighbourhood ID | Identifier for the neighbourhood | yes
Room Type | string | yes
Amenities | List of amenity IDs | yes
Nightly Prices | list | yes
Date | date | yes
Price | float | yes
Average Rating | Float (NULL of number of reviews = 0) | yes
Recommendation Weight | Object | yes

### Booking Details (from Inventory)
Booking details are provided when a booking is performed. The booking is consumed by Inventory, and Inventory adds on additional values related to the listing.

Property | Possible Values | Required
---------|-----------------|----------
Listing ID | Identifier for the listing | yes
User ID | (coordinate range with Behaviour) | yes
Search ID | Identifier for search | yes
Neighbourhood | Identifier for the neighbourhood | yes
Room Type | string | yes
Amenities | List of amenity IDs | yes
Nightly Prices | list | yes
Date | date | yes
Price | float | yes
Average Rating | Float (NULL of number of reviews = 0) | yes


## Messages Published

### Sort Order Scores 
If there are no values provided for coefficients, assume weight is 1.0. The sort order scores are used by the search service to sort search results.

Subscribers: Search Service

Property | Description | Required
---------|-------------|----------
Recommendations ID | integer | yes
Date | date | yes
Rules | Object (with below keys/values) | yes
room type | string | no
market id | integer |no
neighborhood | string | no
amenities | array of integers | no
user id | integer | yes
price range | array [min price, max price] | no
Coefficients | Object (with below keys/values) | yes
price | float (-2.00 - 2.00) | no
amenities | Set of coefficient to apply for available amenities | no
id | integer | no
coefficient | float (-2.00 - 2.00) | no
room type | object (key as room type_id (string), value as float) | no
type | string | no
coefficient | float (-2.00 - 2.00) | no
rating | float (-2.00 - 2.00)| no

### Format 

For example, a scoring update message could look like:
```javascript
[
  {
    recommendationId: 12345,
    date: '2017-10-20T21:39:37Z',
    rules: {
      userId: 54321, 
      marketId: 10, 
      neighborhood: 'Castro', 
      amenities: [1, 3, 4, 5], 
      roomType: 'entire home'
    }
    coefficients: 
      priceCoefficient: -1.2    
    }
  }
]
```
## Schema Design

### Inventory Service Schema
![Inventory Service Schema](https://github.com/model-airbnb/Recommendation/blob/master/docs/images/image3.jpg "Inventory Service Schema")

### Recommendation Service Schema
![Recommendation Service Schema](https://github.com/model-airbnb/Recommendation/blob/master/docs/images/image1.jpg "Recommendation Service Schema")















