import React, { useEffect } from 'react'
import "../styles/Hero.css"
import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

import slide1 from "../assets/images/slide1.png";
import slide2 from "../assets/images/slide2.png";
import slide3 from "../assets/images/slide3.png";
import slide4 from "../assets/images/slide4.png";
import slide5 from "../assets/images/slide5.png";

const Hero = () => {

    const [currentState, setCurrentState] = useState(0);

    const slides=[
        {
            id: 1,
            img: slide1,
            Link: "/products"
        },
        {
            id: 2,
            img: slide2,
            Link: "/products"
        },
        {
            id: 3,
            img: slide3,
            Link: "/products"
        },
        {
            id: 4,
            img: slide4,
            Link: "/products"
        },
        {
            id: 5,
            img: slide5,
            Link: "/products"
        }
    ]

    const nextSlide=()=>{
        if(currentState === slides.length-1){
            setCurrentState(0)
        }else{
            setCurrentState(currentState+1)
        }
    }

    const prevSlide=()=>{
        if(currentState === 0){
            setCurrentState(slides.length-1)
        }else{
            setCurrentState(currentState-1)
        }
    }

    useEffect(()=>{
        const interval = setInterval(() => {
            nextSlide()
        }, 5000);
        return () => clearInterval(interval);
    },[])


  return (
    <section className='hero'>
        <div className='hero-slider'>
            {
                slides.map((slide, index)=>{
                    return(
                        <div key={slide.id} className={index === currentState ? "slide active" : "slide"}>
                            <img src={slide.img} alt={`slide1 ${slide.id}`} />
                        </div>
                    )
                })
            }
            <div className='hero-btn'>
                <button onClick={prevSlide}><FiChevronLeft /></button>
                <button onClick={nextSlide}><FiChevronRight /></button>
            </div>
        </div>
    </section>
  )
}

export default Hero
