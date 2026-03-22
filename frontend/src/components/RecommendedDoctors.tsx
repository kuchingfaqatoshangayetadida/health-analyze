import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';

interface Doctor {
  _id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviewCount: number;
}

interface RecommendedDoctorsProps {
  doctors: Doctor[];
  onContact: (doctor: Doctor) => void;
}

const RecommendedDoctors: React.FC<RecommendedDoctorsProps> = ({ doctors, onContact }) => {
  if (!doctors || doctors.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-3">
      <h4 className="font-semibold text-sm mb-3 px-1">Tavsiya etilgan shifokorlar:</h4>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {doctors.map(doctor => (
          <div key={doctor._id} className="flex-shrink-0 w-44 bg-white p-3 rounded-xl shadow-md text-center border border-gray-100">
            <img src={doctor.avatar} alt={doctor.name} className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-primary-light" />
            <p className="font-bold text-sm mt-2 truncate">{doctor.name}</p>
            <div className="flex items-center justify-center text-xs text-yellow-500 mt-1">
              <Icon icon="lucide:star" className="w-4 h-4 fill-current" />
              <span className="font-semibold ml-1">{doctor.rating.toFixed(1)}</span>
              <span className="text-gray-400 ml-1.5">({doctor.reviewCount})</span>
            </div>
            <Button size="sm" variant="flat" color="primary" className="mt-3 w-full" onPress={() => onContact(doctor)}>Bog'lanish</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedDoctors;