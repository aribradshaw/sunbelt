# User Configuration System

This folder contains user-specific configuration files that define all the information displayed on the Account page and used throughout the application.

## File Structure

```
src/users/
├── types.ts          # TypeScript interfaces for user configuration
├── index.ts          # Main export file and utility functions
├── samherst.ts       # South Amherst Village user configuration
├── ld2.ts           # Legislative District 2 user configuration
├── lorain.ts        # Lorain Municipal Court user configuration
└── README.md        # This documentation file
```

## Adding a New User

To add a new user, follow these steps:

### 1. Create a new user configuration file

Create a new file in the `src/users/` folder (e.g., `newuser.ts`):

```typescript
import type { UserConfig } from './types';

export const newUserConfig: UserConfig = {
  username: 'newuser',
  password: 'password123',
  portal: 'NewPortal',
  location: 'New Location Name',
  campaignDescription: 'Description of the campaign or user',
  socialLinks: {
    facebook: 'https://www.facebook.com/username',
    twitter: 'https://twitter.com/username',
    instagram: 'https://instagram.com/username',
    website: 'https://website.com',
  },
  contactInfo: {
    email: 'contact@email.com',
    phone: '+1-555-123-4567',
  },
  adminInfo: {
    email: 'admin@email.com',
    phone: '+1-555-987-6543',
  },
  additionalInfo: {
    // Any custom fields specific to this user
    customField: 'Custom Value',
  },
};

export default newUserConfig;
```

### 2. Add the user to the index file

Update `src/users/index.ts` to include your new user:

```typescript
import newUserConfig from './newuser';

export const userConfigs: UserConfigs = {
  SouthAmherst: samherstConfig,
  LD2: ld2Config,
  Lorain: lorainConfig,
  NewPortal: newUserConfig, // Add this line
};
```

### 3. Update the constituency list (if needed)

If this user has a specific constituency, add it to the `initialConstituencies` array in `src/App.tsx`:

```typescript
{ name: "New Constituency", voters: [], selectable: true, group: "NEW GROUP" },
```

### 4. Add constituency filtering logic

Update the `allowedConstituencies` logic in `src/App.tsx` to include your new portal:

```typescript
} else if (user.portal === 'NewPortal') {
  return initialConstituencies.filter(c => c.group === 'NEW GROUP' && c.name === 'New Constituency');
}
```

## Configuration Options

### Required Fields
- `username`: Login username
- `password`: Login password  
- `portal`: Unique identifier for the user type
- `location`: Display name for the user's location
- `campaignDescription`: Description shown in the User Description section

### Optional Fields
- `socialLinks`: Object containing social media links
  - `facebook`: Facebook page URL
  - `twitter`: Twitter profile URL
  - `instagram`: Instagram profile URL
  - `website`: Campaign website URL
- `fundraising`: Object containing fundraising platform links
  - `winred`: WinRed fundraising page URL
  - `anedot`: Anedot fundraising page URL
  - `stripe`: Stripe payment page URL
  - `custom`: Custom fundraising platform URL
- `contactInfo`: Public contact information
  - `email`: Public contact email
  - `phone`: Public phone number
- `adminInfo`: Administrative contact information
  - `email`: Admin email for password changes and technical support
  - `phone`: Admin phone number
- `additionalInfo`: Custom fields specific to the user

## Examples

### Basic User
```typescript
export const basicUserConfig: UserConfig = {
  username: 'basic',
  password: 'password',
  portal: 'Basic',
  location: 'Basic Location',
  campaignDescription: 'Basic campaign description',
};
```

### Full-Featured User
```typescript
export const fullUserConfig: UserConfig = {
  username: 'fulluser',
  password: 'password123',
  portal: 'FullUser',
  location: 'Full Location',
  campaignDescription: 'Comprehensive campaign with all features',
  socialLinks: {
    facebook: 'https://facebook.com/fulluser',
    twitter: 'https://twitter.com/fulluser',
    instagram: 'https://instagram.com/fulluser',
    website: 'https://fulluser.com',
  },
  fundraising: {
    winred: 'https://winred.com/fulluser',
    anedot: 'https://anedot.com/fulluser',
    stripe: 'https://stripe.com/fulluser',
  },
  contactInfo: {
    email: 'fulluser@example.com',
    phone: '+1-555-123-4567',
  },
  additionalInfo: {
    candidateName: 'Full User',
    electionYear: '2025',
    position: 'Mayor',
  },
};
```

## Benefits

- **Modular**: Each user has their own configuration file
- **Type-safe**: TypeScript interfaces ensure consistency
- **Extensible**: Easy to add new users and features
- **Maintainable**: Clear separation of user-specific data
- **Reusable**: Configuration can be used across multiple components
