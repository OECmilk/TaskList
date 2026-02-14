'use client';

import { useState } from 'react';
import ProfileModal from '@/components/Modal/ProfileModal';

const EditProfileButton = () => {

    const [isOpenModal, setIsOpenModal] = useState(false);

    return (
        <div>
            <button
                onClick={() => setIsOpenModal(true)}
                className="btn-primary block w-full"
            >
                Edit Profile
            </button>

            <ProfileModal isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} />
        </div>
    )
};


export default EditProfileButton;