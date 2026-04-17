import Reward from '../models/Reward.js';

// GET /api/v1/rewards - fetch all rewards
export const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ pointCost: 1 });
    res.json({ rewards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/v1/rewards/seed - seed initial rewards (dev only)
export const seedRewards = async (req, res) => {
  try {
    await Reward.collection.dropIndexes();
    await Reward.deleteMany({});

    const defaults = [
      {
        title: 'Canteen Meal Voucher',
        description: 'One free meal at the campus canteen.',
        pointCost: 800,
        sponsorCollege: 'Campus Canteen',
        inventoryLimit: -1,
      },
      {
        title: 'Free Coffee',
        description: 'A hot cup of filter coffee from campus cafe.',
        pointCost: 500,
        sponsorCollege: 'Campus Cafe',
        inventoryLimit: -1,
      },
      {
        title: 'Streak Shield',
        description: 'Protect your green streak for 1 day. Miss a commute without losing your streak. Activate from your profile.',
        pointCost: 2000,
        sponsorCollege: 'Treco Rewards',
        inventoryLimit: -1,
      },
      {
        title: 'Eco Water Bottle',
        description: 'Stainless steel insulated bottle, campus branded.',
        pointCost: 2500,
        sponsorCollege: 'Green Campus Initiative',
        inventoryLimit: 200,
      },
      {
        title: '20% Off Pizza',
        description: "Valid on medium and large sizes at Domino's.",
        pointCost: 3000,
        sponsorCollege: "Domino's",
        inventoryLimit: -1,
      },
      {
        title: 'Bus Pass (1 Week)',
        description: 'Free 7-day unlimited city bus pass.',
        pointCost: 5000,
        sponsorCollege: 'City Transport Corp',
        inventoryLimit: 100,
      },
      {
        title: 'MacBook Skin',
        description: 'Premium custom-fit laptop skins from TechStore.',
        pointCost: 8500,
        sponsorCollege: 'TechStore',
        inventoryLimit: 50,
      },
    ];

    await Reward.insertMany(defaults);
    res.status(201).json({ message: 'Rewards seeded successfully.', count: defaults.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
