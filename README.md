# egeoffrey-collection-core

This is an eGeoffrey collection package.

## Description

An All-In-One collection of the core eGeoffrey packages.

## Install

To install this package, run the following command from within your eGeoffrey installation directory:
```
egeoffrey-cli install egeoffrey-collection-core
```
After the installation, remember to run also `egeoffrey-cli start` to ensure the Docker image of the package is effectively downloaded and started.
To validate the installation, go and visit the *'eGeoffrey Admin'* / *'Packages'* page of your eGeoffrey instance. All the modules, default configuration files and out-of-the-box contents if any will be automatically deployed and made available.
## Content

The following modules are included in this package.

For each module, if requiring a configuration file to start, its settings will be listed under *'Module configuration'*. Additionally, if the module is a service, the configuration expected to be provided by each registered sensor associated to the service is listed under *'Service configuration'*.

To configure each module included in this package, once started, click on the *'Edit Configuration'* button on the *'eGeoffrey Admin'* / *'Modules'* page of your eGeoffrey instance.
- **controller/logger**: takes care of collecting the logs from all the local and remote modules, storing them in the database and printing them out
  - Module configuration:
    - *retention**: number of days to keep old logs in the database (e.g. 6)
- **controller/db**: connects to the database and runs queries on behalf of other modules
  - Module configuration:
    - *hostname**: the IP/hostname the Redis database is listening to (e.g. egeoffrey-database)
    - *port**: the port the Redis database is listening to (e.g. 6379)
    - *database**: the database number to use for storing the information (e.g. 1)
- **controller/config**: stores configuration files on behalf of all the modules and makes them available
- **controller/alerter**: keep running the configured rules which would trigger notifications
  - Module configuration:
    - *retention**: number of days to keep old logs in the database (e.g. 6)
- **controller/chatbot**: interactive chatbot service
  - Module configuration:
    - *vocabulary**: chatbot's basic vocabulary
- **controller/hub**: hub for collecting new measures from sensors
  - Module configuration:
    - *calculate**: aggregation policies that can be associated to sensors to e.g. automatically calculate average, minimum and maximum per hour/day
    - *retain**: retention policies that can be associated to sensors to e.g. automatically purge old values from the database
    - *post_processors**: set of available post processing commands that can be associated to sensors to e.g. automatically post-process a new value once collected
- **gui/webserver**: runs the webserver serving eGeoffrey's web interface
- **interaction/slack**: connect to a slack channel as a bot and interact with the user
  - Module configuration:
    - *bot_token**: the Slack legacy token the chatbot will use to connect to Slack
    - *bot_name**: the name of the bot as it will show up on Slack (e.g. housebot)
    - *channel**: the name of the channel the chatbot has to join (e.g. channel_name)
- **notification/betamax_sms**: send out sms notifications (betamax voip service)
  - Module configuration:
    - *from**: the phone number to be used as the from of the message (e.g. 112341231232)
    - *hostname**: the Betamax hostname of your service (e.g. www.frevoipdeal.com)
    - *username**: the username of your betamax account (e.g. username)
    - *password**: the password of your betamax account (e.g. password)
    - *ssl**: use SSL
    - *to**: recipient phone number(s), comma separated (e.g. 112341231232)
- **notification/slack**: make a phone call through an attached serial device (just a few rings)
  - Module configuration:
    - *bot_token**: the Slack legacy token the chatbot will use to connect to Slack
    - *bot_name**: the name of the bot as it will show up on Slack (e.g. housebot)
    - *channel**: the name of the channel the chatbot will send notifications to (e.g. channel_name)
- **notification/smtp**: send out email notifications
  - Module configuration:
    - *from**: the email address used as the from of the message (e.g. user@email.com)
    - *hostname**: the SMTP server used to send out the email (e.g. smtp.google.com)
    - *username*: the username for authenticating against the SMTP server (e.g. username)
    - *password*: the password for authenticating against the SMTP server (e.g. password)
    - *tls**: use TLS
    - *to**: recipient email address(es), comma separated (e.g. user@email.com)
    - *subject**: subject of the email (e.g. House Notification)
    - *template**: template to use for the email's body
- **service/command**: run system commands
  - Service configuration:
    - Mode 'actuator':
      - *command**: command to run (e.g. reboot)
    - Mode 'pull':
      - *command**: command to run (e.g. uptime)
- **service/csv**: retrieve values from a csv file
  - Service configuration:
    - Mode 'pull':
      - *csv_file**: location or URL of the CSV file (e.g. https://www1.ncdc.noaa.gov/pub/data/cdo/samples/NORMAL_DLY_sample_csv.csv)
      - *value_position**: column number which contains the value to extract
      - *filter*: if defined, only the lines of the file with this value at this position will be evaluated
      - *filter_position*: the column you want to filter in the csv file
      - *date_position*: the column of the date (UTC) in the csv file
      - *date_format*: the format of the date in strftime format
      - *prefix*: an optional prefix of the value (that will be striped out) used as additional filter
- **service/earthquake**: retrieve earthquake information
  - Service configuration:
    - Mode 'pull':
      - *domain**: the domain hosting the FDSN Web Services (e.g. earthquake.usgs.gov)
      - *query**: a query in the format key1=value1&key=value2 (e.g. minmag=7)
- **service/fcc_weather**: retrieve weather information from Free Code Camp Weather API
  - Service configuration:
    - Mode 'pull':
      - *request**: what to measure
      - *latitude**: the latitude of the location (e.g. 12.33)
      - *longitude**: the longitude of the location (e.g. 70.11)
- **service/icloud**: retrieve position of a device from Apple icloud service
  - Service configuration:
    - Mode 'pull':
      - *username**: the username of the icloud account (e.g. username@email.com)
      - *password**: the password of the icloud account
      - *device_name**: the name of the device to monitor (e.g. my_iPhone)
- **service/image**: retrieve images from a url or by running a command
  - Service configuration:
    - Mode 'pull':
      - *url*: download the image from this URL (e.g. http://domain.com/image.jpg)
      - *command*: run a command returning an image (e.g. raspistill -w 640 -h 480 -o -)
      - *username*: username if the URL requires basic authentication (e.g. username)
      - *password**: password if the URL requires basic authentication (e.g. password)
- **service/mqtt**: interact with sensors through a mqtt broker
  - Module configuration:
    - *hostname**: the MQTT hostname to connect to (e.g. egeoffrey-gateway)
    - *port**: the port of the MQTT broker (e.g. 1883)
    - *username*: the username for authenticating against the mqtt broker (e.g. username)
    - *password*: the password for authenticating against the mqtt broker (e.g. password)
  - Service configuration:
    - Mode 'push':
      - *topic**: the topic to subscribe (e.g. /sensors/in)
    - Mode 'actuator':
      - *topic**: the topic to publish to (e.g. /sensors/out)
- **service/openweathermap**: retrieve weather information from OpenWeatherMap
  - Module configuration:
    - *api_key**: your OpenWeatherMap API key
  - Service configuration:
    - Mode 'pull':
      - *request**: what to measure
      - *latitude**: the latitude of the location (e.g. 12.33)
      - *longitude**: the longitude of the location (e.g. 70.11)
- **service/rss**: parse a RSS feed
  - Service configuration:
    - Mode 'pull':
      - *url**: the url of the RSS feed (e.g. http://rss.cnn.com/rss/cnn_latest.rss)
- **service/weatherchannel**: retrieve weather information from weatherchannel
  - Module configuration:
    - *api_key**: your WeatherChannel API key
  - Service configuration:
    - Mode 'pull':
      - *request**: what to request
      - *latitude**: the latitude of the location (e.g. 12.33)
      - *longitude**: the longitude of the location (e.g. 70.11)

## Contribute

If you are the author of this package, simply clone the repository, apply any change you would need and run the following command from within this package's directory to commit your changes and automatically push them to Github:
```
egeoffrey-cli commit "<comment>"
```
After taking this action, remember you still need to build (see below) the package (e.g. the Docker image) to make it available for installation.

If you are a user willing to contribute to somebody's else package, submit your PR (Pull Request); the author will take care of validating your contributation, merging the new content and building a new version.

## Build

Building is required only if you are the author of the package. To build a Docker image and automatically push it to [Docker Hub](https://hub.docker.com/r/egeoffrey/egeoffrey-collection-core), run the following command from within this package's directory:
```
egeoffrey-cli build egeoffrey-collection-core <amd64|arm>
```
To function properly, when running in a Docker container, the following additional configuration settings has to be added to e.g. your docker-compose.yml file (when installing through egeoffrey-cli, this is not needed since done automatically upon installation):
```
environment:
- EGEOFFREY_LOGGING_LOCAL=0
ports:
- 80:80
volumes:
- ./data/egeoffrey/logs:/egeoffrey/logs
- ./data/egeoffrey/config:/egeoffrey/config
```

## Uninstall

To uninstall this package, run the following command from within your eGeoffrey installation directory:
```
egeoffrey-cli uninstall egeoffrey-collection-core
```
Remember to run also `egeoffrey-cli start` to ensure the changes are correctly applied.
## Tags

The following tags are associated to this package:
```
collection core
```

## Version

The version of this egeoffrey-collection-core is 1.0-23 on the master branch.
