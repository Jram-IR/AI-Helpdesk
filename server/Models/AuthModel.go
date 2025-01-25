package models

type User struct {
	Uname          string   `json:"uname" bson:"uname" validate:"required"`       // Lowercase, required
	Email          string   `json:"email" bson:"email" validate:"required,email"` // Lowercase, required, valid email
	Password       string   `json:"password" bson:"password" validate:"required"` // Lowercase, required
	ThreadsInDepts []string `json:"threadsInDepts" bson:"threadsInDepts" validate:"required"`
}

type Admin struct {
	Name     string `json:"name" bson:"name" validate:"required"`         // Lowercase, required
	Email    string `json:"email" bson:"email" validate:"required,email"` // Lowercase, required, valid email
	Password string `json:"password" bson:"password" validate:"required"` // Lowercase, required
	Dept     string `json:"dept" bson:"dept" validate:"required"`         // Lowercase, required
}

func (a *Admin) GetPassword() string {
	if a == nil {
		return ""
	}
	return a.Password
}

func (u *User) GetPassword() string {
	if u == nil {
		return ""
	}
	return u.Password
}
func (u *User) GetEmail() string {
	if u == nil {
		return ""
	}
	return u.Email
}
func (a *Admin) GetEmail() string {
	if a == nil {
		return ""
	}
	return a.Email
}
func (u *User) GetName() string {
	if u == nil {
		return ""
	}
	return u.Uname
}
func (a *Admin) GetName() string {
	if a == nil {
		return ""
	}
	return a.Name
}

func (u *User) GetThreadsByDept() []string {
	if u == nil {
		return []string{}
	}
	return u.ThreadsInDepts
}

func (u *Admin) GetThreadsByDept() []string {
	return []string{}
}
