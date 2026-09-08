import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sms, Lock, Eye, EyeSlash, InfoCircle } from 'iconsax-react-native';
import { useRouter } from 'expo-router';
import PrimaryBtn from '@/components/ui/PrimaryBtn';
// import GoBack from '@/components/ui/GoBack';
import Checkbox from '@/components/ui/Checkbox';
import { useLogin } from '@/hooks/use-auth';
import { getErrorMessage } from '@/utils/error';
import {
  getRememberedEmail,
  saveRememberedEmail,
  removeRememberedEmail,
} from '@/store/auth-store';

import { BackHandler } from 'react-native';
import { useAuthContext } from '@/context/auth-context';

export default function LoginCom() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const loginMutation = useLogin();

  // Instant zero-delay redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, router]);

  // Disable physical Android back button on Login screen after logout
  useEffect(() => {
    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Strictly prevents going back into protected screens
    });
    return () => backSubscription.remove();
  }, []);

  // Load remembered email on component mount
  useEffect(() => {
    async function loadRememberedCredentials() {
      const savedEmail = await getRememberedEmail();
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
    loadRememberedCredentials();
  }, []);

  if (isAuthenticated || isLoading) {
    return null;
  }

  const handleLogin = async () => {
    setClientError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setClientError('Please enter your email address');
      return;
    }

    if (!password) {
      setClientError('Please enter your password');
      return;
    }

    // Save or clear remembered email based on user selection
    if (rememberMe) {
      await saveRememberedEmail(trimmedEmail);
    } else {
      await removeRememberedEmail();
    }

    // Trigger TanStack Query mutation
    loginMutation.mutate(
      { email: trimmedEmail, password },
      {
        onSuccess: () => {
          router.replace('/(tabs)/dashboard');
        },
      }
    );
  };

  const errorMessage =
    clientError ||
    (loginMutation.isError ? getErrorMessage(loginMutation.error) : null);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8 flex-1">
            {/* BACK */}
            {/* <View className="mb-10">
              <GoBack />
              
            </View> */}

            {/* TITLE & LOGO */}
            <View className="items-center mb-12">
              <View className="w-[88px] h-[88px] rounded-[24px] bg-black items-center justify-center p-2 mb-3 border border-[#F2EEF4] shadow-sm">
                <Image
                  source={require('@/assets/images/nsa-logo.png')}
                  style={{ width: 72, height: 72, borderRadius: 18 }}
                  resizeMode="contain"
                />
              </View>
              <Text className="font-urbanist-bold text-[26px] text-[#1E1E2D]">
                National Skating Academy
              </Text>
              <Text className="text-[14px] text-[#8E8E93] mt-1 font-urbanist-medium">
                Sign In to access your coach portal
              </Text>
            </View>

            {/* ERROR BANNER */}
            {errorMessage ? (
              <View className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-3.5 flex-row items-center gap-2.5">
                <InfoCircle size={20} color="#DC2626" />
                <Text className="text-red-700 text-[14px] flex-1 font-urbanist-medium">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* EMAIL */}
            <View className="mb-6">
              <Text className="text-base text-[#A2A2A7] mb-2 font-urbanist-medium">
                Email Address
              </Text>

              <View className="flex-row items-center gap-3 border-b border-[#F4F4F4] pb-2">
                <Sms size={20} color="#A2A2A7" />

                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#A2A2A7"
                  className="flex-1 text-base text-[#1E1E2D]"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (clientError) setClientError(null);
                    if (loginMutation.isError) loginMutation.reset();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loginMutation.isPending}
                />
              </View>
            </View>

            {/* PASSWORD */}
            <View className="mb-5">
              <Text className="text-base text-[#A2A2A7] mb-2 font-urbanist-medium">
                Password
              </Text>

              <View className="flex-row items-center gap-3 border-b border-[#F4F4F4] pb-2">
                <Lock size={20} color="#A2A2A7" />

                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#A2A2A7"
                  className="flex-1 text-base text-[#1E1E2D]"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (clientError) setClientError(null);
                    if (loginMutation.isError) loginMutation.reset();
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loginMutation.isPending}
                  onSubmitEditing={handleLogin}
                  returnKeyType="go"
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <Eye size={20} color="#1E1E2D" />
                  ) : (
                    <EyeSlash size={20} color="#A2A2A7" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* REMEMBER ME ROW */}
            <View className="flex-row items-center justify-between mt-2">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={setRememberMe}
              />
            </View>
          </View>

          {/* SUBMIT BUTTON */}
          <View>
            <PrimaryBtn
              label={loginMutation.isPending ? "Signing In..." : "Sign In"}
              onPress={handleLogin}
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}