// Package main demonstrates a production-ready CLI application using Cobra and Viper
package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	cfgFile string
	verbose bool
)

// Config represents application configuration
type Config struct {
	Server ServerConfig `mapstructure:"server"`
	Log    LogConfig    `mapstructure:"log"`
}

type ServerConfig struct {
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
}

type LogConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
}

// rootCmd represents the base command
var rootCmd = &cobra.Command{
	Use:   "myapp",
	Short: "A production-ready CLI application",
	Long: `myapp is a CLI application demonstrating best practices for
command-line tools in Go using Cobra and Viper.`,
}

// versionCmd represents the version command
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("myapp v1.0.0")
	},
}

// configCmd represents the config command group
var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Manage configuration",
}

// configShowCmd shows current configuration
var configShowCmd = &cobra.Command{
	Use:   "show",
	Short: "Show current configuration",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := loadConfig()
		if err != nil {
			return err
		}

		fmt.Printf("Configuration:\n")
		fmt.Printf("  Server Host: %s\n", cfg.Server.Host)
		fmt.Printf("  Server Port: %d\n", cfg.Server.Port)
		fmt.Printf("  Log Level:   %s\n", cfg.Log.Level)
		fmt.Printf("  Log Format:  %s\n", cfg.Log.Format)

		return nil
	},
}

// configInitCmd generates a sample config file
var configInitCmd = &cobra.Command{
	Use:   "init",
	Short: "Generate sample configuration file",
	RunE: func(cmd *cobra.Command, args []string) error {
		home, err := os.UserHomeDir()
		if err != nil {
			return err
		}

		configPath := filepath.Join(home, ".myapp", "config.yaml")

		// Create directory
		if err := os.MkdirAll(filepath.Dir(configPath), 0755); err != nil {
			return err
		}

		// Set defaults
		viper.SetDefault("server.host", "localhost")
		viper.SetDefault("server.port", 8080)
		viper.SetDefault("log.level", "info")
		viper.SetDefault("log.format", "json")

		// Write config
		if err := viper.WriteConfigAs(configPath); err != nil {
			return err
		}

		fmt.Printf("Configuration file created: %s\n", configPath)
		return nil
	},
}

// serverCmd represents the server command group
var serverCmd = &cobra.Command{
	Use:   "server",
	Short: "Server operations",
}

// serverStartCmd starts the server
var serverStartCmd = &cobra.Command{
	Use:   "start",
	Short: "Start the server",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := loadConfig()
		if err != nil {
			return err
		}

		if verbose {
			fmt.Printf("Starting server on %s:%d\n", cfg.Server.Host, cfg.Server.Port)
		}

		// Server start logic would go here
		fmt.Println("Server started successfully")
		return nil
	},
}

// userCmd represents the user command group
var userCmd = &cobra.Command{
	Use:   "user",
	Short: "User management",
}

var (
	userEmail string
	userRole  string
)

// userCreateCmd creates a new user
var userCreateCmd = &cobra.Command{
	Use:   "create [name]",
	Short: "Create a new user",
	Args:  cobra.ExactArgs(1),
	Example: `  # Create a user with email
  myapp user create john --email john@example.com
  
  # Create an admin user
  myapp user create admin --email admin@example.com --role admin`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		// Validate name
		name := args[0]
		if len(name) < 3 {
			return fmt.Errorf("name must be at least 3 characters")
		}

		// Validate email
		if userEmail == "" {
			return fmt.Errorf("email is required")
		}

		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]

		if verbose {
			fmt.Printf("Creating user: %s (%s) with role: %s\n", name, userEmail, userRole)
		}

		// User creation logic would go here
		fmt.Printf("User '%s' created successfully\n", name)
		return nil
	},
}

// userListCmd lists all users
var userListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all users",
	RunE: func(cmd *cobra.Command, args []string) error {
		if verbose {
			fmt.Println("Fetching users...")
		}

		// List users logic would go here
		fmt.Println("Users:")
		fmt.Println("  1. john (john@example.com)")
		fmt.Println("  2. jane (jane@example.com)")

		return nil
	},
}

func init() {
	cobra.OnInitialize(initConfig)

	// Global flags
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.myapp/config.yaml)")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")

	// Add commands
	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(configCmd)
	rootCmd.AddCommand(serverCmd)
	rootCmd.AddCommand(userCmd)

	// Config subcommands
	configCmd.AddCommand(configShowCmd)
	configCmd.AddCommand(configInitCmd)

	// Server subcommands
	serverCmd.AddCommand(serverStartCmd)

	// User subcommands
	userCmd.AddCommand(userCreateCmd)
	userCmd.AddCommand(userListCmd)

	// User create flags
	userCreateCmd.Flags().StringVar(&userEmail, "email", "", "user email (required)")
	userCreateCmd.Flags().StringVar(&userRole, "role", "user", "user role (user, admin)")
	userCreateCmd.MarkFlagRequired("email")
}

func initConfig() {
	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		home, err := os.UserHomeDir()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}

		viper.AddConfigPath(filepath.Join(home, ".myapp"))
		viper.AddConfigPath(".")
		viper.SetConfigName("config")
		viper.SetConfigType("yaml")
	}

	// Environment variables
	viper.SetEnvPrefix("MYAPP")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	// Set defaults
	viper.SetDefault("server.host", "localhost")
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("log.level", "info")
	viper.SetDefault("log.format", "json")

	// Read config file (ignore if not found)
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			fmt.Fprintf(os.Stderr, "Error reading config: %v\n", err)
		}
	}
}

func loadConfig() (*Config, error) {
	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Validate
	if cfg.Server.Port < 1 || cfg.Server.Port > 65535 {
		return nil, fmt.Errorf("invalid port: %d", cfg.Server.Port)
	}

	return &cfg, nil
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

