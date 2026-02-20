// Package main demonstrates a production-ready gRPC microservice
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"log/slog"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// User represents a user in the system
type User struct {
	ID        int64
	Name      string
	Email     string
	CreatedAt time.Time
}

var ErrNotFound = errors.New("user not found")

// UserRepository handles user data operations
type UserRepository struct {
	users map[int64]*User
}

func NewUserRepository() *UserRepository {
	return &UserRepository{
		users: make(map[int64]*User),
	}
}

func (r *UserRepository) GetUser(ctx context.Context, id int64) (*User, error) {
	user, ok := r.users[id]
	if !ok {
		return nil, ErrNotFound
	}
	return user, nil
}

func (r *UserRepository) CreateUser(ctx context.Context, name, email string) (*User, error) {
	id := int64(len(r.users) + 1)
	user := &User{
		ID:        id,
		Name:      name,
		Email:     email,
		CreatedAt: time.Now(),
	}
	r.users[id] = user
	return user, nil
}

// UserServiceServer implements the gRPC UserService
type UserServiceServer struct {
	repo   *UserRepository
	logger *slog.Logger
}

func NewUserServiceServer(logger *slog.Logger) *UserServiceServer {
	return &UserServiceServer{
		repo:   NewUserRepository(),
		logger: logger,
	}
}

// GetUser retrieves a user by ID
func (s *UserServiceServer) GetUser(ctx context.Context, req *GetUserRequest) (*GetUserResponse, error) {
	if req.Id <= 0 {
		return nil, status.Error(codes.InvalidArgument, "user ID must be positive")
	}

	user, err := s.repo.GetUser(ctx, req.Id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return nil, status.Error(codes.NotFound, "user not found")
		}
		s.logger.Error("failed to get user", "error", err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	return &GetUserResponse{
		User: &UserProto{
			Id:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			CreatedAt: user.CreatedAt.Unix(),
		},
	}, nil
}

// CreateUser creates a new user
func (s *UserServiceServer) CreateUser(ctx context.Context, req *CreateUserRequest) (*CreateUserResponse, error) {
	if req.Name == "" {
		return nil, status.Error(codes.InvalidArgument, "name is required")
	}
	if req.Email == "" {
		return nil, status.Error(codes.InvalidArgument, "email is required")
	}

	user, err := s.repo.CreateUser(ctx, req.Name, req.Email)
	if err != nil {
		s.logger.Error("failed to create user", "error", err)
		return nil, status.Error(codes.Internal, "internal error")
	}

	s.logger.Info("user created", "id", user.ID, "name", user.Name)

	return &CreateUserResponse{
		User: &UserProto{
			Id:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			CreatedAt: user.CreatedAt.Unix(),
		},
	}, nil
}

// Logging interceptor
func loggingUnaryInterceptor(logger *slog.Logger) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		start := time.Now()

		resp, err := handler(ctx, req)

		logger.Info("gRPC call",
			"method", info.FullMethod,
			"duration_ms", time.Since(start).Milliseconds(),
			"error", err,
		)

		return resp, err
	}
}

// Recovery interceptor
func recoveryUnaryInterceptor(logger *slog.Logger) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
		defer func() {
			if r := recover(); r != nil {
				logger.Error("panic recovered", "panic", r, "method", info.FullMethod)
				err = status.Error(codes.Internal, "internal error")
			}
		}()
		return handler(ctx, req)
	}
}

// Server manages the gRPC server lifecycle
type Server struct {
	grpcServer *grpc.Server
	listener   net.Listener
	logger     *slog.Logger
}

func NewServer(port int, logger *slog.Logger) (*Server, error) {
	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return nil, err
	}

	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			recoveryUnaryInterceptor(logger),
			loggingUnaryInterceptor(logger),
		),
	)

	// Register service
	userService := NewUserServiceServer(logger)
	RegisterUserServiceServer(grpcServer, userService)

	return &Server{
		grpcServer: grpcServer,
		listener:   listener,
		logger:     logger,
	}, nil
}

func (s *Server) Start() error {
	s.logger.Info("gRPC server starting", "addr", s.listener.Addr())
	return s.grpcServer.Serve(s.listener)
}

func (s *Server) Stop() {
	s.logger.Info("gRPC server stopping")
	s.grpcServer.GracefulStop()
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	srv, err := NewServer(50051, logger)
	if err != nil {
		log.Fatal(err)
	}

	// Start server in goroutine
	go func() {
		if err := srv.Start(); err != nil {
			logger.Error("server failed", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("shutdown signal received")
	srv.Stop()
	logger.Info("server stopped")
}

// Proto message definitions (normally generated from .proto files)
type GetUserRequest struct {
	Id int64
}

type GetUserResponse struct {
	User *UserProto
}

type CreateUserRequest struct {
	Name  string
	Email string
}

type CreateUserResponse struct {
	User *UserProto
}

type UserProto struct {
	Id        int64
	Name      string
	Email     string
	CreatedAt int64
}

// Service registration (normally generated)
func RegisterUserServiceServer(s *grpc.Server, srv *UserServiceServer) {
	// Registration logic would be generated by protoc
}

