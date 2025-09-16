"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/UI/Buttons/Button';
import Image from 'next/image';

type Props = {
  imageSrc: string;
  imageAlt: string;
  message: string;
  actionLabel: string;
  actionHref: string;
  imageClassName?: string;
  messageClassName?: string;
  buttonClassName?: string;
};

const ActionEmptyState: React.FC<Props> = ({
  imageSrc,
  imageAlt,
  message,
  actionLabel,
  actionHref,
  imageClassName = 'w-56 h-auto mx-auto mb-6',
  messageClassName = 'text-black60 mb-6',
  buttonClassName = ''
}) => {
  const router = useRouter();

  return (
    <>
      <Image src={imageSrc} alt={imageAlt} width={256} height={256} className={imageClassName} priority unoptimized />
      <p className={messageClassName}>{message}</p>
      <Button onClick={() => router.push(actionHref)} variant="primary" size="lg" rounded className={buttonClassName}>
        {actionLabel}
      </Button>
    </>
  );
};

export default React.memo(ActionEmptyState);
