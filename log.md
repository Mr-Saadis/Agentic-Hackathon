#### SQL Quer
 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

 2. Create Custom ENUM Types
CREATE TYPE language_preference AS ENUM ('ur', 'en', 'auto');
CREATE TYPE kyc_status_tier AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE provider_status_tier AS ENUM ('available', 'busy', 'offline');
CREATE TYPE job_complexity_tier AS ENUM ('basic', 'intermediate', 'complex');
CREATE TYPE job_urgency_tier AS ENUM ('standard', 'urgent');
CREATE TYPE booking_status_tier AS ENUM ('pending', 'confirmed', 'en_route', 'arrived', 'in_progress', 'completed', 'disputed', 'cancelled');

 3. Create 'users' Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    preferred_language language_preference DEFAULT 'auto',
    wallet_balance NUMERIC(10,2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    pdpa_consent BOOLEAN DEFAULT FALSE,
    pdpa_consent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

4. Create 'providers' Table
CREATE TABLE public.providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT UNIQUE NOT NULL,
    cnic_verified BOOLEAN DEFAULT FALSE,
    kyc_status kyc_status_tier DEFAULT 'pending',
    skills TEXT[] DEFAULT '{}',
    base_rate JSONB DEFAULT '{}'::jsonb,
    current_status provider_status_tier DEFAULT 'offline',
    reliability_score INTEGER DEFAULT 100 CHECK (reliability_score BETWEEN 0 AND 100),
    avg_rating NUMERIC(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    cancellation_rate NUMERIC(5,4) DEFAULT 0.0000,
    newbie_boost_remaining INTEGER DEFAULT 5 CHECK (newbie_boost_remaining BETWEEN 0 AND 5),
    last_known_lat NUMERIC(9,6),
    last_known_lng NUMERIC(9,6),
    suspended_until TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

 5. Create 'bookings' Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL,
    complexity job_complexity_tier DEFAULT 'basic',
    urgency job_urgency_tier DEFAULT 'standard',
    scheduled_at TIMESTAMPTZ NOT NULL,
    status booking_status_tier DEFAULT 'pending',
    price_breakdown JSONB DEFAULT '{}'::jsonb,
    antigravity_trace JSONB DEFAULT '{}'::jsonb,
    proof_media_urls TEXT[] DEFAULT '{}',
    dispute_id UUID DEFAULT NULL, -- Linked via app resolution logic
    departed_at TIMESTAMPTZ,
    arrived_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

6. Create 'agent_logs' Table (Crucial for Hackathon Evaluation)
CREATE TABLE public.agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    reasoning_trace TEXT NOT NULL,
    confidence_score NUMERIC(3,2),
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

7. Automated Trigger for updated_at Fields
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_providers_modtime BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 

The Antigravity Prompt (Ready to Copy):
You are an expert React Native (Expo) engineer specializing in authentication UX for multilingual, mobile-first applications. You are building the Authentication & Onboarding screens for ServeIQ — an AI-powered service orchestrator for Pakistan's informal economy — using Expo and Supabase Auth.

Build the complete, production-quality authentication and onboarding screen sequence as described below. Output complete component code for each screen, including navigation wiring via React Navigation (Stack Navigator), all state management, and Supabase client calls.

SCREENS TO BUILD (in sequence):

1. PhoneInputScreen.tsx
   - Single phone number input field in E.164 format (Pakistani numbers: +92XXXXXXXXXX)
   - Auto-format: user types 03001234567, display converts to +92 3001234567
   - "Send OTP" button → calls supabase.auth.signInWithOtp({ phone: formattedPhone })
   - Loading state during OTP send; error handling for invalid numbers
   - Pakistani flag prefix indicator (+92)

2. OTPVerificationScreen.tsx
   - 6-digit OTP input (split into 6 individual digit boxes for UX clarity)
   - Auto-advance to next box on digit entry
   - 60-second countdown resend timer; "Resend OTP" only active after timer expires
   - On submit → calls supabase.auth.verifyOtp({ phone, token, type: 'sms' })
   - On success → navigate to LanguageSelectionScreen
   - Error state: "Galat code — dobara try karein" in both Urdu and English

3. LanguageSelectionScreen.tsx
   - Three large, tappable cards: "اردو" (Urdu), "English", "Auto-Detect"
   - Selected card gets a highlighted border (primary color)
   - Maps to preferred_language ENUM values: 'ur', 'en', 'auto'
   - Store selection in local state; no DB write yet (combined on next screen)

4. ConsentScreen.tsx
   - Scrollable consent text (PDPA 2023 compliant) with mandatory scroll-to-bottom before checkbox activates
   - A single mandatory checkbox: "Main ServeIQ ki data collection policy se mutafiq hoon"
   - Checkbox MUST be checked to proceed — "Aage Barho" button is disabled (grey) until checked
   - On confirm: write to Supabase users table — { name: null (to be set later), preferred_language: selectedLang, pdpa_consent: true, pdpa_consent_at: new Date().toISOString() }
   - On success → navigate to HomeScreen shell

ARCHITECTURAL CONSTRAINTS:
- JWT tokens: stored via expo-secure-store, NOT AsyncStorage (security requirement)
- Supabase anon key: loaded from .env via Expo Constants (never hardcoded)
- RLS is active — the insert to users table must be done as the authenticated user (use the session returned by verifyOtp)
- Non-consent must block registration: if user cancels consent screen, return to PhoneInputScreen and clear session

EDGE CASES TO HANDLE:
- OTP expired: show "Code expire ho gaya — dobara bhejein" with auto-trigger resend
- Network offline during OTP send: queue-aware error message, retry button
- User already registered (existing phone): bypass onboarding, go directly to HomeScreen
- Language auto-detection: flag in context for Antigravity to use when preferred_language = 'auto'

OUTPUT: Complete TypeScript/TSX code for all 4 screens, shared Supabase client singleton (lib/supabase.ts), navigation types, and the users table insert helper function.



Awesome, Step 1 is accepted and locked. Now let's move to Step 2 and build the first screen in the stack: `src/screens/auth/PhoneInputScreen.tsx`.

Requirements:
1. UI/UX: Create a clean, minimalist layout with a Pakistani flag prefix (+92) indicator and a single phone number text input field. Use NativeWind/Tailwind or standard StyleSheet for professional styling.
2. Auto-Format: If the user types a local number starting with 0 (e.g., '03001234567'), dynamically format the display to '+92 3001234567' and handle input validation.
3. Logic: A "Send OTP" button that enters a loading spinner state while invoking our Supabase client singleton:
   supabase.auth.signInWithOtp({ phone: formattedE164Phone })
4. Error Handling: Gracefully catch and display error messages if the network goes offline or the number structure is invalid.
5. Navigation: Use the strongly typed navigation stack from `src/navigation/types.ts`. Upon a successful OTP response, automatically navigate to the 'OTPVerification' screen, passing the formatted phone number as a route parameter.

Return the complete TypeScript/TSX code for PhoneInputScreen.tsx. Do not build any other screens yet.


Fantastic. Step 2 is locked. Let's move to Step 3 and build `src/screens/auth/OTPVerificationScreen.tsx`.

Requirements:
1. UI/UX: 
   - Render a text showing "Code successfully sent to [Phone Number]" using route.params.phone.
   - Implement a split 6-digit OTP UI (6 individual sequential text input boxes instead of a single field). 
   - Ensure focus auto-advances to the next box upon digit entry, and handles backspace gracefully (reverts focus to the previous box).
2. Resend Timer Logic:
   - Include a 60-second visual countdown timer display.
   - The "Resend OTP" button must remain disabled and styled grey until the countdown timer hits 0. When clicked at 0, it should re-trigger `signInWithOtp` and reset the timer.
3. Supabase Verification:
   - On completion of the 6th digit, trigger loading state and invoke:
     const { data, error } = await supabase.auth.verifyOtp({ phone: route.params.phone, token: enteredOTP, type: 'sms' });
4. Intelligent Routing Rules:
   - Error Case: Display an error text under fields: "Galat code — dobara try karein / Invalid code — try again".
   - Success Case: Once authenticated, query the existing 'public.users' table to check if a record with `id === session.user.id` already exists.
     - If the record EXISTS: Bypass the remaining onboarding steps and navigate directly to 'HomeShell'.
     - If the record DOES NOT EXIST: This is a new user, so navigate to the next screen: 'LanguageSelection'.

Return the complete TypeScript/TSX code for OTPVerificationScreen.tsx using standard React Native StyleSheet or NativeWind. Do not touch any other files.




Brilliant, Step 3 is accepted and fully locked. Let's finish the onboarding stack by implementing Step 4, which includes `src/screens/auth/LanguageSelectionScreen.tsx` and `src/screens/auth/ConsentScreen.tsx`.

LanguageSelectionScreen Requirements:
1. UI/UX: Render three large, visually distinctive, tappable cards: "اردو" (Urdu), "English", and "Auto-Detect". The selected card must dynamically render with a highlighted primary border.
2. State Mapping: These selections map directly to our database language_preference ENUM values: 'ur', 'en', 'auto'.
3. Navigation: Store the choice in local state and pass it forward as a route parameter to the ConsentScreen.

ConsentScreen Requirements:
1. UI/UX: Render a scrollable text container containing mock privacy policy text compliant with Pakistan's PDPA 2023. The mandatory checkbox MUST remain disabled (greyed out) until the user scrolls completely to the absolute bottom of the text container.
2. Checkbox & Button: A single checkbox reading: "Main ServeIQ ki data collection policy se mutafiq hoon". The "Aage Barho" action button is disabled (greyed out) until the checkbox is ticked.
3. Database Operation: On clicking the "Aage Barho" button, trigger a loading spinner and write the onboarding record to our existing 'public.users' table for the currently authenticated session:
   { 
     id: auth.uid(), 
     preferred_language: selectedLang, 
     pdpa_consent: true, 
     pdpa_consent_at: new Date().toISOString() 
   }
4. Lifecycle Routing: 
   - On success: Navigate directly to 'HomeShell'.
   - On cancel/decline: Clear the active Supabase auth session using supabase.auth.signOut() and safely return the user to the 'PhoneInput' screen.

Return the complete TypeScript/TSX code for both screens using standard React Native StyleSheet or NativeWind. No other file mutations.



Awesome. The Authentication and Onboarding stack is accepted and fully locked. Let's move to the next logical task: Building the primary user landing page, `src/screens/main/HomeScreen.tsx` (the core interface for our HomeShell stack).

Requirements based on Section 6 (FR-U-02 and FR-U-03) of PRD.md:
1. UI/UX Layout (WhatsApp-inspired "Zero Friction" design):
   - A top header bar displaying: "Assalam-o-Alaikum, Aapko kya madad chahiye?"
   - A central scrollable view that renders chat bubbles dynamically.
   - A sticky, fixed bottom container containing a clean text input bar ("Apna masla likhein...") and a circular Microphone icon button for voice notes.
2. Local Chat State Management:
   - Implement a local messages array state: `messages: Array<{ id: string; text: string; sender: 'user' | 'ai'; type: 'text' | 'chips'; chips?: string[] }>`.
   - Separate styles for user bubbles (aligned right, primary color background) and AI bubbles (aligned left, light gray background).
3. Local UI Flow Simulation (Before backend integration):
   - When the user types a message and hits the send button, append their message to the local state, clear the text input, and automatically trigger an active loading spinner (representing the AI agent processing the request).
   - Mock a simulated AI reply after 1.5 seconds. If the user input contains the word "AC", make the mock AI reply trigger a clarification payload type: text: "G-13 ke liye AC ka kya kaam karwana hai?", type: 'chips', chips: ['Gas Refill', 'General Service', 'Not Cooling'].
   - Tapping any displayed quick-reply chip should automatically append that text as a new user message and clear the chips state.

Return the complete TypeScript/TSX code for HomeScreen.tsx using standard React Native StyleSheet or NativeWind. Keep the code isolated to this screen component.









