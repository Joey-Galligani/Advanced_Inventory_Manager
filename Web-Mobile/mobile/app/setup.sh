#!/bin/bash

# Create necessary folders for the components and styles if they don't exist
mkdir -p services pages styles

# Creating some initial files for components and styles
echo "Creating initial component and style files..."

# Create components
touch components/ProductCard.tsx components/CameraScanner.tsx components/ProfileInfo.tsx components/ActionButtons.tsx

# Create pages
touch pages/Home.tsx

# Create services (if they don't exist)
touch services/api.ts services/useUserStore.ts

# Create initial CSS module files
echo "Creating initial CSS module files..."

touch styles/Home.module.css styles/ProductCard.module.css

# Add initial content to the files (for example purposes)

# ProductCard component
echo "import React from 'react';
import { View, Image, Text } from 'react-native';
import styles from '../styles/ProductCard.module.css';

const ProductCard = ({ product }) => (
  <View style={styles.productCard}>
    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
    <View style={styles.productInfo}>
      <Text style={styles.productName}>{product.name}</Text>
      <Text>{product.category}</Text>
      <Text>Price: {product.price.toFixed(2)} €</Text>
    </View>
  </View>
);

export default ProductCard;" > components/ProductCard.tsx

# CameraScanner component
echo "import React, { useState } from 'react';
import { CameraView } from 'expo-camera';
import { View } from 'react-native';
import styles from '../styles/Home.module.css';

const CameraScanner = ({ onScan }) => {
  const [scanned, setScanned] = useState(true);
  
  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    onScan(data);
  };

  return (
    <View style={styles.cameraContainer}>
      {!scanned ? (
        <CameraView
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['upc_a', 'ean13', 'upc_e'],
          }}
          style={styles.cameraPreview}
        />
      ) : null}
    </View>
  );
};

export default CameraScanner;" > components/CameraScanner.tsx

# ProfileInfo component
echo "import React from 'react';
import { View, Text } from 'react-native';

const ProfileInfo = ({ user }) => (
  <View>
    <Text>Email: {user.email}</Text>
    <Text>Role: {user.role}</Text>
  </View>
);

export default ProfileInfo;" > components/ProfileInfo.tsx

# ActionButtons component
echo "import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const ActionButtons = ({ onNavigate, onLogout }) => (
  <>
    <TouchableOpacity style={{ backgroundColor: 'blue', padding: 10, alignItems: 'center' }} onPress={onNavigate}>
      <Text style={{ color: 'white' }}>Go to Profile</Text>
    </TouchableOpacity>
    <TouchableOpacity style={{ backgroundColor: 'blue', padding: 10, alignItems: 'center' }} onPress={onLogout}>
      <Text style={{ color: 'white' }}>Logout</Text>
    </TouchableOpacity>
  </>
);

export default ActionButtons;" > components/ActionButtons.tsx

# Home component
echo "import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useUserStore } from '../services/useUserStore';
import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { getProduct, isError, logout } from '../services/api';
import CameraScanner from '../components/CameraScanner';
import ProductCard from '../components/ProductCard';
import ProfileInfo from '../components/ProfileInfo';
import ActionButtons from '../components/ActionButtons';
import styles from '../styles/Home.module.css';

const Home = () => {
  const { user, clearUser } = useUserStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (barcode) {
      getProduct(barcode).then((response) => {
        if (!isError(response) && response?._id) {
          setProducts((prev) => [...prev, response]);
        } else {
          console.error('Invalid product response:', response);
        }
      });
    }
  }, [barcode]);

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      router.navigate('/login');
    } catch (error) {
      console.error('Failed to logout');
    }
  };

  const handleBarcodeScan = (data) => {
    setBarcode(data);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.resultText}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title='Grant Permission' />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome, {user.username}!</Text>
      <ProfileInfo user={user} />
      <ActionButtons onNavigate={() => router.navigate('./Profile')} onLogout={handleLogout} />
      <CameraScanner onScan={handleBarcodeScan} />
      <View>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </View>
    </View>
  );
};

export default Home;" > pages/Home.tsx

# Print out a success message
echo "Setup completed successfully! You can now start developing in the './src/' directory."
