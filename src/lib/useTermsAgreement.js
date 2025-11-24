// src/lib/useTermsAgreement.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TERMS_ACCEPTED_KEY = '@discoverqa_terms_accepted';

export const useTermsAgreement = () => {
  const [hasAccepted, setHasAccepted] = useState(null); // null = loading
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkTermsAcceptance();
  }, []);

  const checkTermsAcceptance = async () => {
    try {
      const accepted = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
      const hasAcceptedTerms = accepted === 'true';
      
      setHasAccepted(hasAcceptedTerms);
      
      // Show modal if not accepted
      if (!hasAcceptedTerms) {
        setShowModal(true);
      }
    } catch (error) {
      console.log('Error checking terms acceptance:', error);
      setHasAccepted(false);
      setShowModal(true);
    }
  };

  const acceptTerms = async () => {
    try {
      await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
      setHasAccepted(true);
      setShowModal(false);
    } catch (error) {
      console.log('Error saving terms acceptance:', error);
    }
  };

  return {
    hasAccepted,
    showModal,
    acceptTerms,
  };
};