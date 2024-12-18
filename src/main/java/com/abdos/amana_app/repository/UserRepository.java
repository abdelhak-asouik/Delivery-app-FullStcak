package com.abdos.amana_app.repository;

import com.abdos.amana_app.model.Role;
import com.abdos.amana_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByRole(Role role); // Méthode pour trouver un utilisateur par rôle// Méthode d'instance sans static
}
