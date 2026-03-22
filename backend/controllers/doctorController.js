import User from '../models/User.js';

export const getRecommendedDoctors = async (req, res) => {
  const { specialty } = req.query;
  if (!specialty) {
    return res.status(400).json({ message: 'Mutaxassislik kiritilmagan' });
  }

  try {
    const doctors = await User.find({ role: 'doctor', specialty: specialty })
      .sort({ rating: -1 })
      .limit(3)
      .select('name avatar specialty rating reviewCount bio');

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Serverda kutilmagan xatolik' });
  }
};