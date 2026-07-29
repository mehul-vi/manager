import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

export default function PageWrapper({ children }) {
    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
            {children}
        </motion.div>
    );
}