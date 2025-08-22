import { useRouter } from 'next/router';

const ProductPage = () => {
    const router = useRouter();
    const { id } = router.query;

    return (
        <div>
            <div>product {id}</div>
            {/* <MainSection/> */}
            {/* <Footer/> */}
        </div>
    );
};

export default ProductPage;
