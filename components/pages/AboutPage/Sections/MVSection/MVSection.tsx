import UsSection from '../usSection/usSection';
import styles from './MVSection.module.css';

const sectionsData = [
  {
    id: 1,
    image: '/acessts/vision.svg', // or whatever your image name is
    imageDirection: 'right' as const,
    title: 'رؤيتنا',
    body: 'هي شركة متخصصة في جميع أنواع الكيماويات وخاصة كيماويات البناء الحديث والدهانات المتخصصة وكيماويات الصباغة والتجهيزوالمواد المساعدة وكيماويات صناعة المنظفات ومستحضرات التجميل. وتعتمد الشركة في تميزها على الجمع بين الخبرات المختلفة والتنوع في المنتجات مع التفرغ في جودة منتجاتها كذلك تعمل الشركة في مجالات معالجة المياه والصرف الصناعي والكيماويات الزراعة والصناعة بأنواعها. كما يوفر خبراء الشركة إستشارات وحلول صناعة ويدية ودعم في متميزلكافة الصناعات الكيماوية.'
  },
  {
    id: 2,
    image: '/acessts/mission.svg', // or whatever your image name is
    imageDirection: 'left' as const,
    title: 'هدفنا',
    body: 'هي شركة متخصصة في جميع أنواع الكيماويات وخاصة كيماويات البناء الحديث والدهانات المتخصصة وكيماويات الصباغة والتجهيزوالمواد المساعدة وكيماويات صناعة المنظفات ومستحضرات التجميل. وتعتمد الشركة في تميزها على الجمع بين الخبرات المختلفة والتنوع في المنتجات مع التفرغ في جودة منتجاتها كذلك تعمل الشركة في مجالات معالجة المياه والصرف الصناعي والكيماويات الزراعة والصناعة بأنواعها. كما يوفر خبراء الشركة إستشارات وحلول صناعة ويدية ودعم في متميزلكافة الصناعات الكيماوية.'
  }
];

export default function MVSection() {
  return (
    <div className={styles.mvSection}>
      {sectionsData.map((section) => (
        <UsSection
          key={section.id}
          image={section.image}
          imageDirection={section.imageDirection}
          title={section.title}
          body={section.body}
        />
      ))}
    </div>
  );
}