'use client';

import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { useState, useEffect, useCallback, ChangeEvent, useMemo } from 'react';

const variants = {
	enter: { opacity: 0, x: 0, filter: 'blur(8px)' },
	center: { opacity: 1, x: 0, filter: 'blur(0px)' },
	exit: { opacity: 0, x: 0, filter: 'blur(8px)' },
};

const DEFAULT_TEXT = `Helloo

welcome to text to slide

this is example
`;

export default function Home() {
	const [lines, setLines] = useState<string>('');
	const [slide, setSlide] = useState<string[]>([]);
	const [activeSlide, setActiveSlide] = useState(0);
	const [copyLink, setCopyLink] = useState(false);

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setLines(e.target.value);
		localStorage.setItem('lines', e.target.value);
	};

	const handleNext = useCallback(() => {
		setActiveSlide((prev) => (prev < slide.length - 1 ? prev + 1 : prev));
	}, [slide.length]);

	const handlePrev = useCallback(() => {
		setActiveSlide((prev) => (prev > 0 ? prev - 1 : prev));
	}, []);

	const fallbackCopyTextToClipboard = useCallback((text: string) => {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			document.execCommand('copy');
			alert('Copied the URL to your clipboard!');
		} catch (err) {
			console.error('Unable to copy URL to clipboard:', err);
			alert(
				'Failed to copy the URL to your clipboard. Please copy it manually.'
			);
		}

		document.body.removeChild(textArea);
	}, []);

	const handleShare = useCallback(() => {
		const encoded = encodeURIComponent(slide.join('\n\n'));
		const url = `${window.location.origin}?slides=${encoded}`;

		if (navigator.clipboard) {
			navigator.clipboard
				.writeText(url)
				.then(() => setCopyLink(true))
				.catch((error) => {
					console.error('Copy link error', error);
					fallbackCopyTextToClipboard(url);
				});
		} else {
			fallbackCopyTextToClipboard(url);
		}

		setTimeout(() => setCopyLink(false), 1200);
	}, [slide, fallbackCopyTextToClipboard]);

	const handleSubmit = useCallback(() => {
		if (!lines) return alert('Please enter some text.');

		const formatSlides = lines
			.split('\n\n')
			.map((line) => {
				const result = line.trim().split('\n').join('<br />');

				const urlRegex = /(https?:\/\/[^\s]+)/g;
				const slideWithLinks = result.replace(
					urlRegex,
					'<a href="$1" target="_blank" rel="noopener noreferrer" class="break-all">$1</a>'
				);

				return slideWithLinks;
			})
			.filter(Boolean);

		setSlide(formatSlides);
	}, [lines]);

	const handleClose = useCallback(() => {
		setActiveSlide(0);
		setSlide([]);
	}, []);

	const handleReset = useCallback(() => {
		setLines('');
		localStorage.setItem('lines', '');
		window.history.pushState({}, document.title, window.location.pathname);
	}, []);

	const currentSlideContent = useMemo(() => {
		return slide[activeSlide] || '';
	}, [slide, activeSlide]);

	useEffect(() => {
		const url = new URL(window.location.href);
		const slideFormUrl = url.searchParams.get('slides');

		if (slideFormUrl) {
			setLines(decodeURIComponent(slideFormUrl));
			setSlide(decodeURIComponent(slideFormUrl).split('\n\n'));

			return;
		}

		const storeText = localStorage.getItem('lines');
		setLines(storeText || DEFAULT_TEXT);
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'ArrowRight') return handleNext();
			if (event.key === 'ArrowLeft') return handlePrev();
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleNext, handlePrev]);

	return (
		<main className="absolute top-0 z-[-2] flex h-screen w-screen flex-col items-center justify-center bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
			{slide.length ? (
				<div className="flex w-full flex-col items-center justify-center space-y-4 p-4 md:w-9/12">
					<motion.h1
						className="text-xl font-bold leading-snug md:text-5xl"
						variants={variants}
						key={activeSlide}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{ duration: 0.5 }}
						dangerouslySetInnerHTML={{
							__html: currentSlideContent,
						}}
					/>

					<div className="fixed bottom-4 flex flex-row items-center space-x-2">
						<Button size="icon" variant="secondary" onClick={handleShare}>
							{copyLink ? '✅' : '🔗'}
						</Button>
						<div className="flex h-9 items-center rounded-md bg-secondary px-3">
							<p className="text-lg">
								{activeSlide + 1} / {slide.length}
							</p>
						</div>
						<Button size="icon" variant="secondary" onClick={handleClose}>
							<XIcon className="h-5 w-5" />
						</Button>
						<Button size="icon" variant="secondary" onClick={handlePrev}>
							<ChevronLeftIcon className="h-5 w-5" />
						</Button>
						<Button size="icon" variant="secondary" onClick={handleNext}>
							<ChevronRightIcon className="h-5 w-5" />
						</Button>
					</div>
				</div>
			) : (
				<div className="relative z-10 w-full space-y-4 p-4 md:w-1/2">
					<div className="flex flex-col items-center justify-center space-y-3">
						<h1 className="text-xl font-bold md:text-5xl">
							Text to Slide
						</h1>
						<p className="text-sm md:text-xl">
							Convert your text into slides. Separate your slides with an
							empty line.
						</p>
					</div>
					<textarea
						className="h-48 max-h-48 min-h-48 min-w-full rounded-lg border border-zinc-300 p-3 text-sm md:text-base"
						value={lines}
						onChange={handleChange}
					/>
					<div className="flex w-full flex-col space-y-3">
						<Button
							size="lg"
							variant="secondary"
							className="w-full"
							onClick={handleReset}
						>
							Reset
						</Button>
						<Button size="lg" className=" w-full" onClick={handleSubmit}>
							Submit
						</Button>
					</div>
				</div>
			)}
		</main>
	);
}
