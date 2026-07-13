package handlers

import "github.com/google/uuid"

func userIDToUUID(id string) uuid.UUID {
	u, err := uuid.Parse(id)
	if err != nil {
		return uuid.Nil
	}
	return u
}