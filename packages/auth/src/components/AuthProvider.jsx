'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(authService.getToken());
  });

  // Multi-tenant: list of orgs the user belongs to, and the active one
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrgState] = useState(null);

  // Initialize auth + org state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        setHasStoredToken(Boolean(token));

        if (token) {
          try {
            const userData = await authService.getCurrentUser();
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
              // Restore stored org data
              const storedOrgs = authService.getStoredOrganizations();
              const storedOrg  = authService.getCurrentOrg();
              setOrganizations(storedOrgs);
              setCurrentOrgState(storedOrg);
            } else {
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
              setOrganizations([]);
              setCurrentOrgState(null);
            }
          } catch (apiError) {
            console.error("Token verification failed:", apiError);
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            setOrganizations([]);
            setCurrentOrgState(null);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setOrganizations([]);
          setCurrentOrgState(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        setOrganizations([]);
        setCurrentOrgState(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        setHasStoredToken(true);

        authService.getCurrentUser().then((fresh) => {
          if (fresh) setUser(fresh);
        }).catch(() => {});

        const orgs = response.organizations || authService.getStoredOrganizations();
        const org  = authService.getCurrentOrg();
        setOrganizations(orgs);
        setCurrentOrgState(org);

        return { success: true, user: response.user, organizations: orgs, currentOrg: org };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      setUser(null);
      setIsAuthenticated(false);
      setOrganizations([]);
      setCurrentOrgState(null);

      let errorMessage = "Login failed. Please try again.";
      if (error.message) errorMessage = error.message;
      else if (typeof error === "string") errorMessage = error;
      else if (error.error?.message) errorMessage = error.error.message;

      return { success: false, error: errorMessage };
    }
  };

  const platformLogin = async (email, password) => {
    try {
      const response = await authService.platformLogin(email, password);

      if (response.user && response.token) {
        if (!response.user.isPlatformAdmin) {
          authService.logout();
          return { success: false, error: 'Only platform administrators can sign in here.' };
        }

        setUser(response.user);
        setIsAuthenticated(true);
        setHasStoredToken(true);
        setOrganizations([]);
        setCurrentOrgState(null);

        authService.getCurrentUser().then((fresh) => {
          if (fresh) setUser(fresh);
        }).catch(() => {});

        return { success: true, user: response.user };
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setOrganizations([]);
      setCurrentOrgState(null);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const isPlatformAdmin = () => authService.isPlatformAdmin(user);

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setHasStoredToken(false);
    setOrganizations([]);
    setCurrentOrgState(null);
  };

  /**
   * Switch the active organization.
   * Returns false if orgId is not in the user's org list.
   */
  const switchOrg = useCallback((orgId) => {
    const switched = authService.setCurrentOrg(orgId);
    if (switched) {
      setCurrentOrgState(authService.getCurrentOrg());
    }
    return switched;
  }, []);

  const hasPermission = (module, action) => {
    if (!user) return false;
    return authService.hasPermission(module, action);
  };

  const canAccessAppModule = (appKey, moduleKey, minimumAccess = 'read') => {
    if (!user) return false;
    return authService.canAccessAppModule(appKey, moduleKey, minimumAccess);
  };

  const hasRole = (roleName) => {
    if (!user) return false;
    return authService.hasRole(roleName);
  };

  const isAdmin = () => {
    if (!user) return false;
    return authService.isAdmin();
  };

  const value = {
    user,
    setUser,
    isAuthenticated,
    loading,
    hasStoredToken,
    login,
    platformLogin,
    logout,
    hasPermission,
    canAccessAppModule,
    hasRole,
    isAdmin,
    isPlatformAdmin,
    // Org / tenant
    organizations,
    currentOrg,
    switchOrg,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
