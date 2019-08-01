#!/bin/bash
set -e

# If left empty default values will be assumed
ACTIVEMQ_HOSTNAME=		# Hostname to ActiveMQ server, default: localhost
ACTIVEMQ_PORT=			# Port to ActiveMQ server , default: 61613 for stomp-client
ACTIVEMQ_QUEUENAME=		# QueueName to send message to, default: pipeline
ACTIVEMQ_USERNAME=		# Username , the one used when going into activeMQ interface, default: admin
ACTIVEMQ_PASSWORD=		# Password, the one used when going into activeMQ interface, default: admin
ACTIVEMQ_JMXHOST=		# JMX hostname , default: localhost
ACTIVEMQ_JMXPORT=   	# JMX port for ActiveMQ server, default: 1099
SLEEP_TIME= 			# Delay/sleep time, in seconds, default: 5
WAIT_QUEUE_SIZE=  		# Max number of enqueued messages before going into slow/sleep mode, default: 100

npm run-script ActiveMQcollect