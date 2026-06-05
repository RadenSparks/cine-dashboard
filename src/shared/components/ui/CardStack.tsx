"use client";
import { useEffect, useState } from "react";
import { DraggableCardBody } from "./DraggableCardBody";

const textColors = [
  "text-blue-900",
  "text-orange-900",
  "text-indigo-900",
  "text-pink-900",
];

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
}: {
  items: Card[];
  offset?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const [cards, setCards] = useState<Card[]>(items);

  // Update cards immediately when items prop changes
  useEffect(() => {
    setCards(items);
  }, [items]);

  return (
    <div className="relative h-80 w-80 md:h-96 md:w-[28rem]">
      {cards.map((card, index) => (
        <DraggableCardBody
          key={card.id}
          gradientIndex={index}
          style={{
            top: index * -CARD_OFFSET,
            zIndex: cards.length - index,
            left: 0,
            right: 0,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div
            className={`flex flex-col items-center gap-2 w-full ${textColors[
              index % textColors.length
            ]}`}
          >
            <div className="mb-2">{card.content}</div>
            <div className="w-full flex flex-col items-center mt-1">
              <p className="font-bold text-base drop-shadow-sm">{card.name}</p>
              <p className="font-normal text-xs drop-shadow-sm">
                {card.designation}
              </p>
            </div>
          </div>
        </DraggableCardBody>
      ))}
    </div>
  );
};
