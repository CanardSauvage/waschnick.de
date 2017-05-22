+++
date = "2017-03-08T08:58:18+02:00"
title = "Queuing with Spring and RabbitMQ - Part 1"

menu = "main"
Tags = ["Development"]
Categories = ["Development"]
Description = "desc"
Released = "false"
+++
Queuing with Spring and RabbitMQ - Part 1- Installing RabbitMQ

screen-shot-2017-03-06-at-10-26-29
Queuing to the rescue

If you start using microservices and distributed appliacations a lot you will run into some problems with the messages you are sending between your services. That's because  with each application the possible erros while communicating multiply. You will want more reliable messaging, because the more distributed your application is, the more you will run into errors while your applications communicate.

One simple and nice solution is Queueing. This blog post will consist of three parts:
* Part 1: Installing RabbitMQ and creating queues with Ansible
* Part 2: Receiving and Sending with Spring
* Part 3: Local testing with QPID, an embedded Broker 

Spring and RabbitMQ

[xml]
&amp;lt;dependency&amp;gt;
    &amp;lt;groupId&amp;gt;org.springframework.boot&amp;lt;/groupId&amp;gt;
    &amp;lt;artifactId&amp;gt;spring-boot-starter-amqp&amp;lt;/artifactId&amp;gt;
&amp;lt;/dependency&amp;gt;
[/xml]
Direct Sending and Receiving

Consuming via Handler

Creating Queues with Ansible
We decided to do this other

Local testing wit QPID embedded AMQP Broker

[java light="true"]&amp;lt;/pre&amp;gt;
&amp;lt;pre&amp;gt;package amqp.embedded;

import org.apache.qpid.server.Broker;
import org.apache.qpid.server.BrokerOptions;
import org.apache.qpid.util.FileUtils;
import org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class EmbeddedAMQPBrokerStarter {

    private final Broker broker = new Broker();

    @Autowired
    private RabbitListenerEndpointRegistry rabbitListenerEndpointRegistry;

    @Value("${spring.rabbitmq.port}")
    private int amqpPort;

    @Value("${spring.rabbitmq.username}")
    private String amqpUsername;

    @Value("${spring.rabbitmq.password}")
    private String amqpPassword;
    @Value("${spring.rabbitmq.virtual-host}")
    private String amqpVirtualHost;

    @PostConstruct
    public void setupEmbeddedAMQPBroker() throws Exception {
        log.info("Preparing to start embedded container broker on port {}.", amqpPort);

        final String configFileName = "/qpid/qpid-config.json";

        final File tempDir = createTempDir();
        final File qpidPasswdFile = new File(tempDir, "passwd.properties");

        try (final InputStream inputStream = createQpidPasswdFile()) {
            FileUtils.copy(inputStream, qpidPasswdFile);
        }
        final File qpidConfigFile = new File(tempDir, "qpid-config.json");
        try (final InputStream inputStream = getResourceAsStream(configFileName)) {
            FileUtils.copy(inputStream, qpidConfigFile);
        }

        // prepare options
        final BrokerOptions brokerOptions = new BrokerOptions();
        brokerOptions.setConfigProperty("qpid.amqp_port", String.valueOf(amqpPort));
        brokerOptions.setInitialConfigurationLocation(qpidConfigFile.getAbsolutePath());
        brokerOptions.setConfigProperty("qpid.broker.defaultPreferenceStoreAttributes", "{\"type\": \"Noop\"}");
        brokerOptions.setConfigProperty("qpid.vhost", amqpVirtualHost);
        brokerOptions.setConfigProperty("qpid.reject.behaviour", "server");
        brokerOptions.setStartupLoggedToSystemOut(false);
        brokerOptions.setConfigurationStoreType("Memory");

        // start broker
        broker.startup(brokerOptions);
    }

    // Copy with thanks from guava
    private static final int TEMP_DIR_ATTEMPTS = 10000;

    private File createTempDir() {
        File baseDir = new File(System.getProperty("java.io.tmpdir"));
        String baseName = System.currentTimeMillis() + "-";

        for (int counter = 0; counter &amp;lt; TEMP_DIR_ATTEMPTS; counter++) {
            File tempDir = new File(baseDir, baseName + counter);
            if (tempDir.mkdir()) {
                return tempDir;
            }
        }
        throw new IllegalStateException("Failed to create directory within "
                + TEMP_DIR_ATTEMPTS + " attempts (tried "
                + baseName + "0 to " + baseName + (TEMP_DIR_ATTEMPTS - 1) + ')');
    }

    @PreDestroy
    public void destroyBroker() {
        log.info("Preparing to shutdown embedded container broker on port {}.", amqpPort);

        try {
            this.broker.shutdown();
            rabbitListenerEndpointRegistry.stop();
            rabbitListenerEndpointRegistry.destroy();
        } catch (Exception e) {
            // log the error
        }
    }

    private InputStream createQpidPasswdFile() throws IOException {
        return new ByteArrayInputStream(String.format("%s:%s", amqpUsername, amqpPassword).getBytes(StandardCharsets.UTF_8));
    }

    private InputStream getResourceAsStream(final String file) throws IOException {
        return getClass().getResourceAsStream(file);
    }
}&amp;lt;/pre&amp;gt;
[/java]
// src/main/resources/qpid/qpid.json

{code}

{
  "name": "Embedded Test Broker",
  "modelVersion": "6.1",
  "authenticationproviders": [
    {
      "name": "password",
      "type": "Plain",
      "secureOnlyMechanisms": [],
      "users": [
        {
          "name": "guest",
          "password": "guest",
          "type": "managed"
        }
      ]
    }
  ],
  "ports": [
    {
      "name": "AMQP",
      "port": "${qpid.amqp_port}",
      "authenticationProvider": "password",
      "protocols": [
        "AMQP_0_9_1"
      ],
      "transports": [
        "TCP"
      ],
      "virtualhostaliases": [
        {
          "name": "${qpid.vhost}",
          "type": "nameAlias"
        }
      ]
    }
  ],
  "virtualhostnodes": [
    {
      "name": "${qpid.vhost}",
      "type": "Memory",
      "virtualHostInitialConfiguration": "{ \"type\": \"Memory\" }"
    }
  ]
}
{code}

// src/main/resources/application.properties

{code}

# Required AMQP config
spring.rabbitmq.port=${pcp.amqp.port:5672}
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
spring.rabbitmq.virtual-host=dev

# Optional
spring.rabbitmq.cache.channel.size=5
spring.rabbitmq.requested-heartbeat=15
spring.rabbitmq.retry.max.attempts=3
# 10 -> 100 -> 1000
spring.rabbitmq.retry.initial.interval=10
spring.rabbitmq.retry.multiplier=10
spring.rabbitmq.retry.max.interval=2000

# These are some official spring boot properties - which do NOT work
#spring.rabbitmq.listener.retry.enabled=true
#spring.rabbitmq.listener.retry.initial-interval=100
#spring.rabbitmq.listener.retry.max-attempts=3
#spring.rabbitmq.listener.retry.multiplier=2
#spring.rabbitmq.listener.retry.max-interval=2000

{code}

Quellen

https://dzone.com/articles/mocking-rabbitmq-for-integration-tests

http://stackoverflow.com/questions/30918557/embedded-amqp-java-broker

