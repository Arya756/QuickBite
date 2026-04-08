import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { RestaurantModel } from './schemas/RestaurantSchema';

dotenv.config();

const restaurants = [
  {
    name: 'Burger King',
    address: 'Connaught Place, Delhi',
    ownerId: 'owner_1',
    isOpen: true,
    rating: 4.2,
    deliveryTime: '20-30 min',
    menu: [
      { id: 'm1', name: 'Whopper Burger', description: 'Our signature flame-grilled beef burger', price: 199, isAvailable: true },
      { id: 'm2', name: 'Chicken Royale', description: 'Crispy chicken with lettuce and mayo', price: 179, isAvailable: true }
    ]
  },
  {
    name: 'Pizza Hut',
    address: 'Saket, Delhi',
    ownerId: 'owner_2',
    isOpen: true,
    rating: 4.5,
    deliveryTime: '30-40 min',
    menu: [
      { id: 'm3', name: 'Pepperoni Feast', description: 'Classic pepperoni with extra cheese', price: 499, isAvailable: true },
      { id: 'm4', name: 'Veggie Supreme', description: 'Loaded with fresh vegetables', price: 399, isAvailable: true }
    ]
  },
  {
    name: 'Subway',
    address: 'Aerocity, Delhi',
    ownerId: 'owner_3',
    isOpen: true,
    rating: 4.0,
    deliveryTime: '15-25 min',
    menu: [
      { id: 'm5', name: 'Italian B.M.T.', description: 'Salami, pepperoni and ham', price: 249, isAvailable: true },
      { id: 'm6', name: 'Roasted Chicken', description: 'Lean roasted chicken breast', price: 229, isAvailable: true }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB for seeding...');
    
    await RestaurantModel.deleteMany({});
    console.log('Cleared existing restaurants');
    
    await RestaurantModel.insertMany(restaurants);
    console.log('Seeded restaurants successfully');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
