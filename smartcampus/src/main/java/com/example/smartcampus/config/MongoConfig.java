package com.example.smartcampus.config;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;

@Configuration
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoClientSettingsBuilderCustomizer() {
        return builder -> {
            try {
                // Trust manager that accepts everything - ONLY for troubleshooting SSL handshake
                TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() { return null; }
                        public void checkClientTrusted(X509Certificate[] certs, String authType) { }
                        public void checkServerTrusted(X509Certificate[] certs, String authType) { }
                    }
                };

                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
                
                builder.applyToSslSettings(ssl -> ssl.enabled(true).context(sslContext).invalidHostNameAllowed(true));
            } catch (Exception e) {
                builder.applyToSslSettings(ssl -> ssl.enabled(true));
            }
        };
    }
}
