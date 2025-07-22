"use client";
import { RootState } from '@/store/store';
import React from 'react';
import { useSelector } from 'react-redux';

const Home = () => {
  const user = useSelector((state:RootState)=>state?.auth.user)
  return (
    <div>Home</div>
  )
}

export default Home