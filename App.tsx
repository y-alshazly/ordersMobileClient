import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Text, Card, RadioButton, List } from 'react-native-paper';
import axios from 'axios';

import menu from './menu.json';

export const App = () => {
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [totalPrice, setTotalPrice] = useState<string>();
  const [Loading, setLoading] = useState<boolean>(false);
  const formattedPrice = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

  const handleSelectDrink = (drinkId: string) => {
    const drink = menu.find(menuItem => menuItem.id === drinkId);

    setSelectedDrink(drinkId);
    setSelectedSize(drink?.details[0].id);
    setTotalPrice(drink?.details[0].price);
  };

  const handleSelectSize = (detailId: string) => {
    const selectedDetail = menu
      .find(menuItem => menuItem.id === selectedDrink)
      ?.details.find(detail => detail.id === detailId);

    setSelectedSize(selectedDetail?.id);
    setTotalPrice(selectedDetail?.price);
  };

  const handleSubmitOrder = async () => {
    try {
      setLoading(true);

      const drink = menu.find(menuItem => menuItem.id === selectedDrink);

      const selectedDetail = menu
        .find(menuItem => menuItem.id === selectedDrink)
        ?.details.find(detail => detail.id === selectedSize);

      const response = await axios.post(
        `http://${Platform.OS === 'ios' ? 'localhost' : '10.0.2.2'}:5001/api/v1/orders`,
        {
          items: [{ id: selectedDetail?.id, name: drink?.name, price: Number(selectedDetail?.price) }],
        },
      );

      console.log('Order submitted:', response.data);
    } catch (error) {
      console.log(1);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';

        Alert.alert('Order Failed', errorMessage);
      } else {
        Alert.alert('Unexpected Error', 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };
  console.log(totalPrice);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText} variant='headlineSmall'>
        Select a Drink
      </Text>

      <List.Section>
        {menu.map(menuItem => (
          <Card key={menuItem.id} style={styles.card} onPress={() => handleSelectDrink(menuItem.id)}>
            <Card.Title title={menuItem.name} subtitle={menuItem.description} subtitleNumberOfLines={3} />
          </Card>
        ))}
      </List.Section>

      {selectedDrink && (
        <>
          <Text style={styles.selectedDrinkName} variant='titleLarge'>
            Selected Drink: {menu.find(menuItem => menuItem.id === selectedDrink)?.name}
          </Text>
          <Text style={styles.sizeText} variant='titleLarge'>
            Select Size
          </Text>
          <View style={styles.pricesContainer}>
            <RadioButton.Group onValueChange={value => handleSelectSize(value)} value={selectedSize || ''}>
              {menu
                .find(item => item.id === selectedDrink)
                ?.details.map(detail => (
                  <RadioButton.Item
                    key={detail.id}
                    label={`${detail.size} - ${formattedPrice.format(Number(detail.price))} $`}
                    value={detail.id}
                  />
                ))}
            </RadioButton.Group>
          </View>

          <Text style={styles.totalPrice} variant='titleMedium'>
            Total Price: {formattedPrice.format(Number(totalPrice))}
          </Text>

          <Button loading={Loading} mode='contained' onPress={handleSubmitOrder} style={styles.submitButton}>
            Submit Order
          </Button>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: '20%' },
  headerText: { textAlign: 'center', marginBottom: 10 },
  card: { margin: 15, padding: 15 },
  selectedDrinkName: { textAlign: 'center', marginBottom: 10 },
  sizeText: { textAlign: 'center' },
  pricesContainer: { borderWidth: 0.5, borderColor: 'black', margin: 10, padding: 5 },
  totalPrice: { textAlign: 'center', marginBottom: 30 },
  submitButton: { width: '80%', alignSelf: 'center' },
});
