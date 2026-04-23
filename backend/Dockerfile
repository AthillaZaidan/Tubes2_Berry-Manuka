# ─── Stage 1: Builder ───────────────────────────────────────────────
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go.mod dan go.sum dulu (untuk cache layer dependency)
COPY go.mod go.sum ./
RUN go mod download

# Copy semua source code
COPY . .

# Build binary executable (static link biar bisa jalan di alpine)
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server main.go

# ─── Stage 2: Runner ────────────────────────────────────────────────
FROM alpine:latest

WORKDIR /app

# Copy binary dari stage builder
COPY --from=builder /app/server .

# Expose port backend
EXPOSE 8080

# Jalanin server
CMD ["./server"]
