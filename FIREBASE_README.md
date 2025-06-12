# 🔥 Firebase/Firestore Integration Guide

## Quick Start

### 1. Configure Firebase Credentials

Run the configuration script:
```bash
configurar-firebase.bat
```

Or manually:
```bash
cp src/services/firebase.ts.example src/services/firebase.ts
# Edit the file with your credentials
```

### 2. Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create one)
3. Go to Project Settings > General
4. Scroll to "Your apps" > "Firebase SDK snippet"
5. Copy the configuration object

### 3. Update firebase.ts

Replace the placeholder values:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🚀 Using Firestore in the App

### Option 1: Upload Page
1. Navigate to the Upload page
2. Find the "Buscar Dados do Firestore" card
3. Configure filters:
   - Year
   - Month
   - State (UF)
   - Political Party
   - Deputy limit
4. Click "Buscar Dados do Firestore"

### Option 2: Dashboard
- The Dashboard automatically displays a real-time ranking from Firestore
- You can adjust filters directly in the ranking component

## 📊 Features

### Real-time Ranking
- Top deputies by expenses
- Dynamic filters
- Automatic suspicion scoring
- Visual indicators (medals for top 3)

### Data Processing
- Converts Firestore data to standard format
- Applies same analysis as CSV uploads
- Generates alerts and patterns
- Saves to localStorage

### Performance
- Configurable limits
- Debounced queries
- Loading states
- Error handling

## 🏗️ Architecture

```
Firestore Database
    ↓
FirestoreService (data fetching)
    ↓
Data Conversion (to GastoParlamentar format)
    ↓
AnalisadorGastos (analysis engine)
    ↓
Dashboard/Visualizations
```

## ⚠️ Important Notes

1. **Credentials Security**: The `firebase.ts` file is gitignored. Never commit real credentials!

2. **Firestore Structure**: The app expects this structure:
   ```
   congressoNacional/
     camaraDeputados/
       legislatura/57/deputados/{id}
       perfilComplementar/{id}/despesas/{year}/{month}/all_despesas
   ```

3. **Costs**: Be aware of Firestore read costs when fetching large datasets

4. **Limits**: Use appropriate limits to avoid overloading

## 🐛 Troubleshooting

### "Permission Denied" Error
- Check Firebase console authentication rules
- Ensure your project allows read access

### No Data Showing
- Verify the Firestore structure matches expected format
- Check if data exists for selected period
- Look at browser console for errors

### Slow Performance
- Reduce deputy limit
- Select specific month instead of full year
- Use state/party filters

## 📝 Example Queries

### Get top 10 deputies from SP in 2025
```
Year: 2025
Month: All months
State: SP
Limit: 10
```

### Get fuel expenses for specific month
```
Year: 2025
Month: January
Expense Type: COMBUSTÍVEIS E LUBRIFICANTES
Limit: 50
```

## 🔗 Related Files

- `/src/services/firebase.ts` - Firebase configuration
- `/src/services/firestore-service.ts` - Data fetching logic
- `/src/components/firestore/FirestoreDataFetcher.tsx` - UI component
- `/src/components/firestore/RankingFirestore.tsx` - Ranking display

## 📚 Documentation

For complete documentation, see:
- `/INTEGRACAO_FIRESTORE.md` - Detailed integration guide
- `/RESUMO_INTEGRACAO_FIRESTORE.md` - Implementation summary

---

**Need help?** Check the browser console for detailed error messages or review the documentation files.
