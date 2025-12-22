package com.gymtracker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymtracker.entity.ServiceAccount;

@Repository
public interface ServiceAccountRepository extends JpaRepository<ServiceAccount, Long> {
    
    Optional<ServiceAccount> findByClientId(String clientId);
    
    Optional<ServiceAccount> findByServiceName(String serviceName);
    
    boolean existsByClientId(String clientId);
}
