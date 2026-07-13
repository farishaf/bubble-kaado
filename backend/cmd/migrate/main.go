package main

import (
	"errors"
	"fmt"
	"os"
	"strconv"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/joho/godotenv"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "usage: migrate <up|down|drop|force VERSION|version>")
		os.Exit(2)
	}
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		fmt.Fprintln(os.Stderr, "DATABASE_URL not set")
		os.Exit(1)
	}

	m, err := migrate.New("file://migrations", dbURL)
	if err != nil {
		fmt.Fprintln(os.Stderr, "migrate new:", err)
		os.Exit(1)
	}
	defer func() {
		serr, derr := m.Close()
		if serr != nil {
			fmt.Fprintln(os.Stderr, "source close:", serr)
		}
		if derr != nil {
			fmt.Fprintln(os.Stderr, "db close:", derr)
		}
	}()

	cmd := os.Args[1]
	switch cmd {
	case "up":
		err = m.Up()
	case "down":
		err = m.Down()
	case "drop":
		err = m.Drop()
	case "force":
		if len(os.Args) < 3 {
			fmt.Fprintln(os.Stderr, "force requires a version")
			os.Exit(2)
		}
		v, perr := strconv.Atoi(os.Args[2])
		if perr != nil {
			fmt.Fprintln(os.Stderr, "version must be integer:", perr)
			os.Exit(2)
		}
		err = m.Force(v)
	case "version":
		v, dirty, verr := m.Version()
		if verr != nil {
			if errors.Is(verr, migrate.ErrNilVersion) {
				fmt.Println("no migrations applied")
				return
			}
			fmt.Fprintln(os.Stderr, "version:", verr)
			os.Exit(1)
		}
		fmt.Printf("version=%d dirty=%v\n", v, dirty)
		return
	default:
		fmt.Fprintln(os.Stderr, "unknown command:", cmd)
		os.Exit(2)
	}

	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		fmt.Fprintln(os.Stderr, "migrate:", err)
		os.Exit(1)
	}
	fmt.Println("ok")
}