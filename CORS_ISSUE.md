# Problema de CORS - Solução

## 🔴 O Problema

O backend está retornando **403 FORBIDDEN** para requisições **OPTIONS** (preflight CORS).

```
Request: OPTIONS http://177.44.248.81:8080/auth/login
Response Status Code: 403 FORBIDDEN
```

## 📋 Por Que Isso Acontece?

1. O navegador envia uma requisição **preflight OPTIONS** antes de fazer POST (CORS)
2. O backend deve responder com status **200** e headers CORS apropriados
3. Como o backend retorna **403**, o navegador bloqueia a requisição POST real

## ✅ Solução

### Opção 1: Configurar CORS no Backend (RECOMENDADO)

No seu projeto Spring (events-gateway), você precisa adicionar uma configuração CORS:

**1. Criar um arquivo `CorsConfig.java`:**

```java
package com.example.eventsgateway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:3002", "http://localhost:3001")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**2. Ou adicionar annotation no controller:**

```java
@RestController
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:3002"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = "*",
    allowCredentials = "true",
    maxAge = 3600
)
@RequestMapping("/auth")
public class AuthController {
    // seu código aqui
}
```

**3. Se estiver usando Spring Boot, adicione ao `application.properties`:**

```properties
server.servlet.context-path=/
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:3002,http://localhost:3001
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
spring.web.cors.max-age=3600
```

### Opção 2: Frontend - Usar proxy (TEMPORÁRIO)

Se não conseguir configurar o backend, você pode usar um proxy no Vite:

**`vite.config.ts`:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://177.44.248.81:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

Depois alterar `GATEWAY_URL` para:
```typescript
export const GATEWAY_URL = '/api';
```

## 🧪 Como Testar

1. Abrir **DevTools** (F12) no navegador
2. Ir até a aba **Network**
3. Tentar fazer login
4. Verificar se:
   - A requisição **OPTIONS** retorna **200**
   - A requisição **POST** é feita e retorna **200**

## 📊 Fluxo Correto de CORS

```
Browser                         Backend
  |                              |
  |---(OPTIONS preflight)------>|
  |                              |
  |<---(200 + CORS headers)-----|
  |                              |
  |---(POST real request)------->|
  |                              |
  |<---(200 + data)--------------|
```

## 🚀 Status Atual

- Frontend: ✅ Configurado para enviar requisições com CORS
- Backend: ❌ Retorna 403 para OPTIONS (precisa configurar CORS)

**Próximo Passo**: Configure CORS no backend conforme as instruções acima!
